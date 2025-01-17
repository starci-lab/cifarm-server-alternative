import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropCurrentState,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { HarvestCropRequest, HarvestCropResponse } from "./harvest-crop.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class HarvestCropService {
    private readonly logger = new Logger(HarvestCropService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService
    ) {}

    async harvestCrop(request: HarvestCropRequest): Promise<HarvestCropResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemTileId },
                relations: {
                    seedGrowthInfo: {
                        crop: true
                    }
                }
            })

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")

            if (placedItemTile.seedGrowthInfo)
                throw new GrpcFailedPreconditionException("Tile is not planted")

            const { seedGrowthInfo } = placedItemTile

            if (seedGrowthInfo.currentState !== CropCurrentState.FullyMatured)
                throw new GrpcFailedPreconditionException("Crop is not fully matured")

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                water: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            // substract energy
            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })
            const experiencesChanges = this.levelService.addExperiences({
                entity: user,
                experiences: experiencesGain
            })

            //get corresponding inventory type
            const product = await queryRunner.manager.findOne(ProductEntity, {
                where: {
                    crop: {
                        id: seedGrowthInfo.crop.id
                    }
                },
                relations: {
                    crop: true
                }
            })

            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    type: InventoryType.Product,
                    productId: product.id
                }
            })

            // Get inventories same type
            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: request.userId,
                    inventoryTypeId: inventoryType.id
                }
            })

            const updatedInventories = this.inventoryService.add({
                entities: existingInventories,
                userId: request.userId,
                data: {
                    inventoryType: inventoryType,
                    quantity: seedGrowthInfo.harvestQuantityRemaining
                }
            })

            await queryRunner.startTransaction()

            try {
                // update user
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                //if current perennial count is equal to crop's perennial count, remove the crop, delete the seed growth info
                if (
                    seedGrowthInfo.currentPerennialCount >=
                    seedGrowthInfo.crop.perennialCount
                ) {
                    await queryRunner.manager.remove(
                        SeedGrowthInfoEntity,
                        seedGrowthInfo
                    )
                } else {
                    // update seed growth info
                    await queryRunner.manager.update(
                        SeedGrowthInfoEntity,
                        seedGrowthInfo.id,
                        {
                            currentPerennialCount:
                                seedGrowthInfo.currentPerennialCount + 1,
                            currentState: CropCurrentState.Normal,
                            currentStageTimeElapsed: 0
                        }
                    )
                }
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
}
