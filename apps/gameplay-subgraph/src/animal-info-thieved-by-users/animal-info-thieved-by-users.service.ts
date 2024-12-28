// import { GetAnimalInfoThiefedByUsersArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { GameplayPostgreSQLService } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class AnimalInfoThievedByUsersService {
    private readonly logger = new Logger(AnimalInfoThievedByUsersService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgresqlService: GameplayPostgreSQLService
    ) {
        this.dataSource = this.gameplayPostgresqlService.getDataSource()
    }
}
