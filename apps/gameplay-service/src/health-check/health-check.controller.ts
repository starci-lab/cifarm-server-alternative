import { Controller, Get, Logger } from "@nestjs/common"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from "@nestjs/terminus"
import { envConfig, healthCheckConfig, timerConfig } from "@src/config"
import { kafkaBrokers } from "@src/brokers"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private microservice: MicroserviceHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get(healthCheckConfig.endpoint)
    @HealthCheck()
    healthz() {
        this.logger.log("Health check endpoint called")
        return this.health.check([
            async () => this.db.pingCheck(healthCheckConfig.names.gameplayPostgresql, { timeout: timerConfig.timeouts.healthcheck }),
            async () =>
                this.microservice.pingCheck<RedisOptions>(healthCheckConfig.names.cacheRedis, {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    },
                    timeout: timerConfig.timeouts.healthcheck,
                }),
            async () =>
                this.microservice.pingCheck<KafkaOptions>(healthCheckConfig.names.kafka, {
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            brokers: kafkaBrokers(),
                        },
                    },
                    timeout: timerConfig.timeouts.healthcheck,
                }),
        ])
    }
}