import { Injectable, Logger } from "@nestjs/common"
import { AnimalEntity, InjectPostgreSQL } from "@src/databases"
import { DataSource, FindOptionsRelations } from "typeorm"
import { GetAnimalsArgs } from "./animals.dto"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    private readonly relations: FindOptionsRelations<AnimalEntity> = {
        product: true,
        inventoryType: true,
        placedItemType: true
    }

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    async getAnimals({ limit = 10, offset = 0 }: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        this.logger.debug(`GetAnimals: limit=${limit}, offset=${offset}`)

        let animals: Array<AnimalEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            animals = await queryRunner.manager.find(AnimalEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
        return animals
    }

    async getAnimal(id: string) {
        this.logger.debug(`GetAnimals: id=${id}`)

        let animal: AnimalEntity
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            animal = await queryRunner.manager.findOne(AnimalEntity, {
                where: {
                    id
                },
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
        return animal
    }
}
