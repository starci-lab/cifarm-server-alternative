import { Injectable, Logger } from "@nestjs/common"
import {
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    TileEntity,
    TileId,
    UserEntity
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource, DeepPartial, QueryRunner } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    private readonly tileOrder = [TileId.BasicTile1, TileId.BasicTile2, TileId.BasicTile3]

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {
    }

    async buyTile(request: BuyTileRequest): Promise<BuyTileResponse> {
        this.logger.debug(`Starting tile purchase for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const currentTileId = await this.determineCurrentTileId(request.userId, queryRunner)

            const tile = await queryRunner.manager.findOne(TileEntity, {
                where: { id: currentTileId }
            })

            if (!tile) {
                throw new GrpcNotFoundException("Tile not found")
            }

            if (!tile.availableInShop) {
                throw new GrpcFailedPreconditionException("Tile not available in shop")
            }

            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: { type: PlacedItemType.Tile, tileId: currentTileId }
            })

            // Calculate total cost
            const totalCost = tile.price

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            // Prepare placed item entity
            const placedItem: DeepPartial<PlacedItemEntity> = {
                userId: request.userId,
                x: request.position.x,
                y: request.position.y,
                placedItemTypeId: placedItemType.id
            }

            // Subtract gold
            const goldsChanged = this.goldBalanceService.subtract({
                entity: user,
                amount: totalCost
            })
            // Start transaction
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...goldsChanged
                })

                // Save the placed item in the database
                await queryRunner.manager.save(PlacedItemEntity, placedItem)

                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            return {}
        } finally {
            await queryRunner.release()
        }
    }

    private async determineCurrentTileId(
        userId: string,
        queryRunner: QueryRunner
    ): Promise<string> {
        for (const tileId of this.tileOrder) {
            const tile = await queryRunner.manager.findOne(TileEntity, { where: { id: tileId } })
            //check inventory
            const inventoryTileCount = await queryRunner.manager.count(InventoryEntity, {
                where: {
                    userId,
                    inventoryType: {
                        tileId: tileId,
                        type: InventoryType.Tile
                    }
                },
                relations: {
                    inventoryType: true
                }
            })

            const placedItemsCount = await queryRunner.manager.count(PlacedItemEntity, {
                where: {
                    userId,
                    placedItemType: {
                        tileId: tileId,
                        type: PlacedItemType.Tile
                    }
                },
                relations: {
                    placedItemType: true
                }
            })

            if ((placedItemsCount + inventoryTileCount) < tile.maxOwnership) {
                return tileId
            }
        }

        throw new GrpcFailedPreconditionException("No tile available")
    }
}
