import { Inject, Injectable } from "@nestjs/common"
import { Sha256Service } from "@src/crypto"
import { PostgreSQLDatabase } from "@src/env"
import { MODULE_OPTIONS_TOKEN } from "./cache-query.module-definition"
import { PostgreSQLCacheQueryOptions } from "./cache-query.types"

@Injectable()
export class PostgreSQLCacheQueryService {
    private readonly useHash: boolean
    private readonly database: PostgreSQLDatabase
    constructor(
            @Inject(MODULE_OPTIONS_TOKEN)
            private readonly options: PostgreSQLCacheQueryOptions,
            private readonly sha256Service: Sha256Service
    ) {
        // Hash is enabled by default
        this.useHash = this.options.useHash || true
        this.database = this.options.database || PostgreSQLDatabase.Gameplay
    }

    public generateCacheKey({
        entityName,
        options
    }: GenerateCacheKeyParams): string {
        const prefix = `postgresql:${this.database}:${entityName}`
        //switch-case for type ensuring
        let postfix = JSON.stringify(options)
        if (this.useHash) {
            postfix = this.sha256Service.hash(postfix)
        }
        return `${prefix}:${postfix}`
    }
}

interface GenerateCacheKeyParams {
    entityName: string
    options: unknown
}