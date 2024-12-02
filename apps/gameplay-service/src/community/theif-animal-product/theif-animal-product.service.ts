import { Inject, Injectable, Logger } from "@nestjs/common"
import {
    HaverstQuantityRemainingEqualMinHarvestQuantityException,
    PlacedItemAnimalNotCurrentlyYieldingException,
    PlacedItemAnimalNotFoundException,
    ThiefAnimalProductTransactionFailedException
} from "@src/exceptions"
import { DataSource } from "typeorm"
import {
    Activities,
    AnimalInfoEntity,
    CropRandomness,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemType,
    ProductType,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { EnergyService, InventoryService, LevelService, TheifService } from "@src/services"
import { ClientKafka } from "@nestjs/microservices"
import { kafkaConfig } from "@src/config"
import { TheifAnimalProductRequest, TheifAnimalProductResponse } from "./theif-animal-product.dto"

@Injectable()
export class TheifAnimalProductService {
    private readonly logger = new Logger(TheifAnimalProductService.name)

    constructor(
        @Inject(kafkaConfig.broadcastPlacedItems.name)
        private readonly clientKafka: ClientKafka,
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly theifService: TheifService,
        private readonly inventoryService: InventoryService
    ) {}

    async theifAnimalProduct(
        request: TheifAnimalProductRequest
    ): Promise<TheifAnimalProductResponse> {
        this.logger.debug(`Theif animal product for user ${request.neighborUserId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // get placed item
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    userId: request.neighborUserId,
                    id: request.placedItemAnimalId,
                    placedItemType: {
                        type: PlacedItemType.Animal
                    }
                },
                relations: {
                    animalInfo: true,
                    placedItemType: true
                }
            })

            if (!placedItemAnimal) {
                throw new PlacedItemAnimalNotFoundException(request.placedItemAnimalId)
            }

            if (!placedItemAnimal.animalInfo.hasYielded) {
                throw new PlacedItemAnimalNotCurrentlyYieldingException(request.placedItemAnimalId)
            }

            if (
                placedItemAnimal.animalInfo.harvestQuantityRemaining ===
                placedItemAnimal.animalInfo.animal.minHarvestQuantity
            ) {
                throw new HaverstQuantityRemainingEqualMinHarvestQuantityException(
                    placedItemAnimal.seedGrowthInfo.crop.minHarvestQuantity
                )
            }

            const { value: activitiesValue } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                thiefAnimalProduct: { energyConsume, experiencesGain }
            } = activitiesValue as Activities

            //get user
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.CropRandomness }
            })
            const { theif2, theif3 } = value as CropRandomness
            const { value: computedQuantity } = this.theifService.compute({
                theif2,
                theif3
            })

            //get the actual quantity
            const actualQuantity = Math.min(
                computedQuantity,
                placedItemAnimal.seedGrowthInfo.harvestQuantityRemaining -
                    placedItemAnimal.seedGrowthInfo.crop.minHarvestQuantity
            )

            // get inventories
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Animal,
                        animalId: placedItemAnimal.animalInfo.animal.id
                    }
                },
                relations: {
                    product: true
                }
            })

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
                    inventoryTypeId: inventoryType.id,
                    quantity: placedItemAnimal.seedGrowthInfo.harvestQuantityRemaining
                }
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

            await queryRunner.startTransaction()
            try {
                // update user
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update inventories
                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                // update seed growth info
                await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
                    harvestQuantityRemaining:
                        placedItemAnimal.animalInfo.harvestQuantityRemaining - actualQuantity
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Theif animal product transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new ThiefAnimalProductTransactionFailedException(error)
            }

            this.clientKafka.emit(kafkaConfig.broadcastPlacedItems.pattern, {
                userId: request.neighborUserId
            })

            return {
                quantity: actualQuantity
            }
        } finally {
            await queryRunner.release()
        }
    }
}