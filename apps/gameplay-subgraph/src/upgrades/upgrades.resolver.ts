import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { UpgradeService } from "./upgrades.service"
import { UpgradeEntity } from "@src/database"
import { GetUpgradesArgs } from "./"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class UpgradeResolver {
    private readonly logger = new Logger(UpgradeResolver.name)

    constructor(private readonly upgradesService: UpgradeService) {}

    @Query(() => [UpgradeEntity], {
        name: "upgrades"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getUpgrades(@Args("args") args: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`getUpgrades: args=${JSON.stringify(args)}`)
        return this.upgradesService.getUpgrades(args)
    }

    @Query(() => UpgradeEntity, {
        name: "upgrade"
    })
    async getUpgradeById(@Args("id") id: string): Promise<UpgradeEntity | null> {
        this.logger.debug(`getUpgradeById: id=${id}`)
        return this.upgradesService.getUpgradeById(id)
    }
}
