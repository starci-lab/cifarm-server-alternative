import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER } from "@nestjs/core"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { redisStore } from "cache-manager-redis-yet"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { AppController } from "./app.controller"
import { BuyAnimalsModule } from "./buy-animal"
import { BuySeedsModule } from "./buy-seeds"
import { BuySuppliesModule } from "./buy-supplies"
import { InventoryModule } from "./inventory"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.host,
            port: envConfig().database.postgres.gameplay.port,
            username: envConfig().database.postgres.gameplay.user,
            password: envConfig().database.postgres.gameplay.pass,
            database: envConfig().database.postgres.gameplay.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                const store = await redisStore({
                    socket: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    }
                })

                return {
                    store: store as unknown as CacheStore,
                    ttl: 3 * 60000 // 3 minutes (milliseconds)
                }
            }
        }),
        BuyAnimalsModule,
        BuySuppliesModule,
        BuySeedsModule,
        InventoryModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GrpcServerExceptionFilter
        }
    ]
})
export class AppModule {}
