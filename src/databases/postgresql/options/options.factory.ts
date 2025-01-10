import { Inject, Injectable } from "@nestjs/common"
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm"
import { envConfig, isProduction, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { CacheOptionsService } from "../../cache-options"
import { MODULE_OPTIONS_TOKEN } from "./options.module-definition"
import { CONNECTION_TIMEOUT_MS, POOL_SIZE } from "../postgresql.constants"
import { getPostgresEntities } from "../postgresql.utils"
import { DataSourceOptions } from "typeorm"
import { PostgreSQLOptions } from "../postgresql.types"
import { PostgreSQLOptionsOptions } from "./options.types"

@Injectable()
export class PostgreSQLOptionsFactory implements TypeOrmOptionsFactory {
    private readonly baseOptions: PostgreSQLOptions
    private readonly database: PostgreSQLDatabase
    private readonly context: PostgreSQLContext

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: PostgreSQLOptionsOptions,
        private readonly cacheOptionsService: CacheOptionsService
    ) {
        this.baseOptions = this.options.options || {}
        this.database = this.baseOptions.database || PostgreSQLDatabase.Gameplay
        this.context = this.baseOptions.context || PostgreSQLContext.Main
    }

    createDataSourceOptions(): DataSourceOptions {
        const { host, password, port, dbName, username } =
            envConfig().databases.postgresql[this.database][this.context]
        return {
            type: "postgres",
            host,
            port,
            username,
            password,
            database: dbName,
            entities: getPostgresEntities(this.baseOptions),
            connectTimeoutMS: CONNECTION_TIMEOUT_MS,
            poolSize: POOL_SIZE
        }
    }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const options = this.createDataSourceOptions()
        return {
            ...options,
            synchronize: !isProduction(),
            cache: this.cacheOptionsService.createCacheOptions()
        }
    }
}