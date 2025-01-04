import { Injectable, Logger } from "@nestjs/common"
import { DeliveringProductEntity, GameplayPostgreSQLService } from "@src/databases"
import { DataSource } from "typeorm"
import { GetDeliveringProductsByUserIdArgs } from "."

@Injectable()
export class DeliveringProductService {
    private readonly logger = new Logger(DeliveringProductService.name)

    private readonly relations = {
        product: true,
    }

    private readonly dataSource: DataSource
        
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async getDeliveringProductsByUserId({
        userId,
        limit = 10,
        offset = 0
    }: GetDeliveringProductsByUserIdArgs): Promise<Array<DeliveringProductEntity>> {
        this.logger.debug(`GetDeliveringProductsByUserId: userId=${userId}, limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const đeliveringProducts = await queryRunner.manager.find(DeliveringProductEntity, {
                where: { userId },
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return đeliveringProducts
        } finally {
            await queryRunner.release()
        }
    }
}
