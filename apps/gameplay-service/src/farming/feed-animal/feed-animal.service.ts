import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalCurrentState,
    AnimalInfoEntity,
    GameplayPostgreSQLService,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    SupplyId,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import {
    FeedAnimalTransactionFailedException,
    InventoryNotFoundException,
    InventoryTypeNotSupplyException,
    PlacedItemAnimalNotFoundException,
    PlacedItemAnimalNotNeedFeedingException
} from "@src/exceptions"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { FeedAnimalRequest, FeedAnimalResponse } from "./feed-animal.dto"

@Injectable()
export class FeedAnimalService {
    private readonly logger = new Logger(FeedAnimalService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async feedAnimal(request: FeedAnimalRequest): Promise<FeedAnimalResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    id: request.placedItemAnimalId,
                    userId: request.userId
                },
                relations: {
                    animalInfo: true
                }
            })

            if (!placedItemAnimal)
                throw new PlacedItemAnimalNotFoundException(request.placedItemAnimalId)

            this.logger.verbose(`Feed animal: ${JSON.stringify(placedItemAnimal)}`)

            if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Hungry)
                throw new PlacedItemAnimalNotNeedFeedingException(request.placedItemAnimalId)

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                feedAnimal: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            // Subtract energy
            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })
            // Update user energy and experience
            const experiencesChanges = this.levelService.addExperiences({
                entity: user,
                experiences: experiencesGain
            })

            // Inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    userId: user.id,
                    // Inventory type is Supply
                    inventoryType: {
                        type: InventoryType.Supply,
                        supplyId: SupplyId.AnimalFeed
                    }
                },
                relations: {
                    inventoryType: true
                }
            })

            if (!inventory) throw new InventoryNotFoundException()

            if (inventory.inventoryType.type !== InventoryType.Supply)
                throw new InventoryTypeNotSupplyException(inventory.id)

            await queryRunner.startTransaction()
            try {
                // Decrease inventory
                await queryRunner.manager.update(InventoryEntity, inventory.id, {
                    quantity: inventory.quantity - 1
                })

                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // Update animal state
                await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
                    currentState: AnimalCurrentState.Normal,
                    currentHungryTime: 0
                })

                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Feed Animal transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new FeedAnimalTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
