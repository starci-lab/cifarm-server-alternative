import { Module } from "@nestjs/common"
// import { DebugRedisClusterModule } from "@src/debug"
import { EnvModule } from "@src/env"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { InventoriesModule } from "./delivering-products"
import { PlacedItemsModule } from "./placed-items"
import { ProductsModule } from "./products"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UpgradesModule } from "./upgrades"
import { PostgreSQLCacheKeyModule, PostgreSQLModule } from "@src/databases"
import { GraphQLSubgraphModule } from "@src/graphql"
import { AnimalsModule } from "./animals"
import { CryptoModule } from "@src/crypto"
import { CacheModule } from "@src/cache"
import { JwtModule } from "@src/jwt"

@Module({
    imports: [
        //core modules
        EnvModule.forRoot(),
        PostgreSQLModule.forRoot(),
        PostgreSQLCacheKeyModule.register({
            isGlobal: true
        }),
        CryptoModule.register({
            isGlobal: true
        }),
        CacheModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            isGlobal: true
        }),
        GraphQLSubgraphModule.forRoot(),

        //functional modules
        AnimalsModule,
        BuildingsModule,
        CropsModule,
        InventoriesModule,
        PlacedItemsModule,
        ProductsModule,
        SuppliesModule,
        SystemsModule,
        TilesModule,
        ToolsModule,
        UpgradesModule,

        //debug modules
        // DebugRedisClusterModule.register({
        //     type: RedisType.Cache,
        //     keys: [createCacheKey({
        //         entity: SystemEntity,
        //         identifier: {
        //             type: SystemId.Activities
        //         }
        //     })]
        // }),
    ]
}) 
export class AppModule {}