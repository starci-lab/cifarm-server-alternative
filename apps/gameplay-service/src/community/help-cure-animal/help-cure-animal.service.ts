import { Inject, Injectable, Logger } from "@nestjs/common"
import {
    HelpCureAnimalTransactionFailedException,
    PlacedItemAnimalNotFoundException,
    PlacedItemAnimalNotSickException
} from "@src/exceptions"
import { DataSource } from "typeorm"
import {
    Activities,
    AnimalCurrentState,
    AnimalInfoEntity,
    PlacedItemEntity,
    PlacedItemType,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { EnergyService, LevelService } from "@src/services"
import { HelpCureAnimalRequest, HelpCureAnimalResponse } from "./help-cure-animal.dto"
import { ClientKafka } from "@nestjs/microservices"
import { kafkaConfig } from "@src/config"

@Injectable()
export class HelpCureAnimalService {
    private readonly logger = new Logger(HelpCureAnimalService.name)

    constructor(
        @Inject(kafkaConfig.broadcastPlacedItems.name)
        private readonly clientKafka: ClientKafka,
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpCureAnimal(request: HelpCureAnimalRequest): Promise<HelpCureAnimalResponse> {
        this.logger.debug(`Help cure animal for user ${request.neighborUserId}`)

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

            if (!placedItemAnimal || !placedItemAnimal.animalInfo) {
                throw new PlacedItemAnimalNotFoundException(request.placedItemAnimalId)
            }

            if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) {
                throw new PlacedItemAnimalNotSickException(request.placedItemAnimalId)
            }

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                helpCureAnimal: { energyConsume, experiencesGain }
            } = value as Activities

            //get user
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

            await queryRunner.startTransaction()
            try {
                // update user
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update animal info
                await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
                    currentState: AnimalCurrentState.Normal
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Help cure animal transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new HelpCureAnimalTransactionFailedException(error)
            }

            this.clientKafka.emit(
                kafkaConfig.broadcastPlacedItems.pattern, {
                    userId: request.neighborUserId
                })

            return {}
        } finally {
            await queryRunner.release()
        }
    }
}