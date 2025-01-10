import { Inject, Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import { HealthIndicatorResult, MicroserviceHealthIndicator, TypeOrmHealthIndicator } from "@nestjs/terminus"
import { KafkaOptionsFactory } from "@src/brokers"
import {
    envConfig,
    PostgreSQLDatabase,
    redisClusterEnabled,
    redisClusterRunInDocker,
    RedisType,
} from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import { NatMap } from "ioredis"
import {
    ADAPTER_REDIS,
    CACHE_REDIS,
    HEALTH_CHECK_TIMEOUT,
    JOB_REDIS
} from "./health-check.constants"
import { MODULE_OPTIONS_TOKEN } from "./health-check.module-definition"
import { HealthCheckDependency, HealthCheckOptions } from "./health-check.types"

@Injectable()
export class HealthCheckCoreService {
    private readonly logger = new Logger(HealthCheckCoreService.name)
    // Redis cluster services
    private readonly execDockerRedisClusterServices: Partial<
        Record<RedisType, ExecDockerRedisClusterService>
    > = {}
    // Kafka service
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: HealthCheckOptions,
        private readonly kafkaOptionsFactory: KafkaOptionsFactory,
        private readonly microservice: MicroserviceHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly moduleRef: ModuleRef
    ) {
        // Initialize Redis cluster services
        if (options.dependencies.includes(HealthCheckDependency.JobRedis)) {
            this.execDockerRedisClusterServices[RedisType.Job] = this.moduleRef.get(
                JOB_REDIS,
                { strict: false }
            )
        }
        if (options.dependencies.includes(HealthCheckDependency.CacheRedis)) {
            this.execDockerRedisClusterServices[RedisType.Cache] = this.moduleRef.get(
                CACHE_REDIS,
                { strict: false }
            )
        }
        if (options.dependencies.includes(HealthCheckDependency.AdapterRedis)) {
            this.execDockerRedisClusterServices[RedisType.Adapter] = this.moduleRef.get(
                ADAPTER_REDIS,
                { strict: false }
            )
        }
    }

    // Ping check for Redis
    public async pingCheckRedis(type: RedisType = RedisType.Cache): Promise<HealthIndicatorResult> {
        const clusterEnabled = redisClusterEnabled(RedisType.Cache)
        if (!clusterEnabled) {
            return await this.microservice.pingCheck<RedisOptions>(
                HealthCheckDependency.CacheRedis,
                {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().databases.redis[RedisType.Cache].host,
                        port: envConfig().databases.redis[RedisType.Cache].port,
                        password: envConfig().databases.redis[RedisType.Cache].password || undefined
                    },
                    timeout: HEALTH_CHECK_TIMEOUT
                }
            )
        }

        let natMap: NatMap
        if (redisClusterRunInDocker(type)) {
            natMap = this.execDockerRedisClusterServices[type].getNatMap()
        }

        return await this.microservice.pingCheck<RedisOptions>(type, {
            transport: Transport.REDIS,
            options: {
                host: envConfig().databases.redis[type].host,
                port: envConfig().databases.redis[type].port,
                password: envConfig().databases.redis[type].password,
                preferredSlaves: true,
                natMap
            },
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }

    // Ping check for Kafka
    public async pingCheckKafka(): Promise<HealthIndicatorResult> {
        return await this.microservice.pingCheck<KafkaOptions>(HealthCheckDependency.Kafka, {
            transport: Transport.KAFKA,
            options: {
                client: this.kafkaOptionsFactory.createKafkaConfig(),
            },
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }

    // Ping check for PostgreSQL (Gameplay)
    public async pingCheckPostgreSql(
        database: PostgreSQLDatabase = PostgreSQLDatabase.Gameplay
    ): Promise<HealthIndicatorResult> {
        const map: Record<PostgreSQLDatabase, HealthCheckDependency> = {
            [PostgreSQLDatabase.Gameplay]: HealthCheckDependency.GameplayPostgreSQL,
            [PostgreSQLDatabase.Telegram]: HealthCheckDependency.TelegramPostgreSQL
        }
        return this.db.pingCheck(map[database], {
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }
}
