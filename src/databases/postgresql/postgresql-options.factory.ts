import { Inject, Injectable } from "@nestjs/common"
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm"
import { envConfig, isProduction, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { CacheOptionsService } from "../cache-options.service"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./postgresql-options.module-definition"
import { CONNECTION_TIMEOUT_MS, POOL_SIZE } from "./postgresql.constants"
import { getPostgresEntities } from "./postgresql.utils"

@Injectable()
export class PostgreSQLOptionsFactory implements TypeOrmOptionsFactory {
    private database: string
    private context: string
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: typeof OPTIONS_TYPE,
        private readonly cacheOptionsService: CacheOptionsService
    ) {
        this.database = options.database || PostgreSQLDatabase.Gameplay
        this.context = options.context || PostgreSQLContext.Main
    }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: "postgres",
            host: envConfig().databases.postgresql[this.database][this.context].host,
            port: envConfig().databases.postgresql[this.database][this.context].port,
            username: envConfig().databases.postgresql[this.database][this.context].username,
            password: envConfig().databases.postgresql[this.database][this.context].password,
            database: envConfig().databases.postgresql[this.database][this.context].dbName,
            entities: getPostgresEntities(this.options),
            synchronize: !isProduction(),
            connectTimeoutMS: CONNECTION_TIMEOUT_MS,
            poolSize: POOL_SIZE,
            cache: this.cacheOptionsService.createCacheOptions()
        }
    }
}
