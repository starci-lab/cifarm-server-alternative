import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { redisStore } from "cache-manager-redis-yet"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.host,
            port: envConfig().database.postgres.gameplay.port,
            username: envConfig().database.postgres.gameplay.user,
            password: envConfig().database.postgres.gameplay.pass,
            database: envConfig().database.postgres.gameplay.dbName,    
            autoLoadEntities: true,
            synchronize: true,
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                const store = await redisStore({
                    socket: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port,
                    },
                })
        
                return {
                    store: store as unknown as CacheStore,
                    ttl: 3 * 60000, // 3 minutes (milliseconds)
                }
            },
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
