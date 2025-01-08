import { Injectable, OnModuleInit } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { InjectCache } from "@src/cache"
import { AnimalEntity, getPostgreSqlDataSourceName, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { Cache } from "cache-manager"

@Injectable()
export class SubService implements OnModuleInit {
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        @InjectCache()
        private readonly cache: Cache
    ) {
    }
    async onModuleInit() {
        const t = await this.dataSource.manager.find(AnimalEntity)
        console.log(t)
    }
}