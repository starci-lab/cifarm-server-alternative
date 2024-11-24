import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, PlacedItemEntity, PlacedItemTypeEntity, UserEntity } from "@src/database"
import {
    BuildingNotAvailableInShopException,
    BuildingNotFoundException,
    PlacedItemTypeNotFoundException,
    UserInsufficientGoldException,
    ConstructBuildingTransactionFailedException
} from "@src/exceptions"
import { GoldBalanceService } from "@src/services"
import { Cache } from "cache-manager"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        this.logger.debug(
            `Starting building construction for user ${request.userId}, building id: ${request.id}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        // Fetch building information
        const building = await queryRunner.manager.findOne(BuildingEntity, {
            where: { id: request.id }
        })

        if (!building) {
            throw new BuildingNotFoundException(request.id)
        }

        if (!building.availableInShop) {
            throw new BuildingNotAvailableInShopException(request.id)
        }

        // Fetch placed item type
        const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
            where: { id: request.id }
        })

        if (!placedItemType) {
            throw new PlacedItemTypeNotFoundException(request.id)
        }

        // Calculate total cost
        const totalCost = building.price

        const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
            where: { id: request.userId }
        })

        if (!this.goldBalanceService.checkSufficient({ entity: user, golds: totalCost }).isEnough)
            throw new UserInsufficientGoldException(user.golds, totalCost)

        // Start transaction
        await queryRunner.startTransaction()

        try {
            // Subtract gold from user balance
            const goldsChanged = this.goldBalanceService.subtract({
                entity: user,
                golds: totalCost
            })

            await queryRunner.manager.save(UserEntity, {
                id: request.userId,
                ...goldsChanged
            })

            // Prepare placed item entity
            const placedItem: DeepPartial<PlacedItemEntity> = {
                user: { id: request.userId },
                buildingInfo: {
                    building
                },
                x: request.position.x,
                y: request.position.y,
                placedItemTypeId: placedItemType.id
            }

            // Save the placed item in the database
            const savedBuilding = await queryRunner.manager.save(PlacedItemEntity, placedItem)

            await queryRunner.commitTransaction()

            this.logger.log(`Successfully constructed building with id: ${savedBuilding.id}`)

            return { placedItemId: savedBuilding.id }
        } catch (error) {
            this.logger.error("Construction transaction failed, rolling back...", error)
            await queryRunner.rollbackTransaction()
            throw new ConstructBuildingTransactionFailedException(error.message)
        } finally {
            await queryRunner.release()
        }
    }
}
