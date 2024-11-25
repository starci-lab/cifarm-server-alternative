import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { SeedDataService } from "@src/services"
import { DataSource } from "typeorm"

@Injectable()
export class AppService implements OnModuleInit {
    private readonly logger = new Logger(AppService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly seedDataService: SeedDataService
    ) {}

    onModuleInit() {
        this.logger.debug("SeedStaticData initialized")
        this.seedDataService.seedStaticData(this.dataSource)
        this.logger.debug("SeedStaticData finished")
    }
}
