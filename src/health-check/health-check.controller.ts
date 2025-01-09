import { Controller, Get, Inject, Logger } from "@nestjs/common"
import {
    HealthCheck,
    HealthCheckService,
    HealthIndicatorFunction,
} from "@nestjs/terminus"
import {
    HEALTH_CHECK_ENDPOINT,
} from "./health-check.constants"
import { HealthCheckDependency, HealthCheckOptions } from "./health-check.types"
import { HealthCheckCoreService } from "./health-check-core.service"
import { HealthCheckContainersService } from "./health-check-containers.service"
import { MODULE_OPTIONS_TOKEN } from "./health-check.module-definition"
import { PostgreSQLDatabase, RedisType } from "@src/env"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: HealthCheckOptions,
        private readonly health: HealthCheckService,
        private readonly healthCheckCoreService: HealthCheckCoreService,
        private readonly healthCheckContainersService: HealthCheckContainersService,
    ) { }

    @Get(HEALTH_CHECK_ENDPOINT)
    @HealthCheck()
    healthz() {
        const healthIndicators: Array<HealthIndicatorFunction> = []

        // Add ping checks based on the dependencies that are enabled
        if (this.options.dependencies.includes(HealthCheckDependency.GameplayPostgreSQL)) {
            healthIndicators.push(async () => this.healthCheckCoreService.pingCheckPostgreSql())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.TelegramPostgreSQL)) {
            healthIndicators.push(async () => this.healthCheckCoreService.pingCheckPostgreSql(PostgreSQLDatabase.Telegram))
        }
        if (this.options.dependencies.includes(HealthCheckDependency.CacheRedis)) {
            healthIndicators.push(async () => this.healthCheckCoreService.pingCheckRedis(RedisType.Cache))
        }
        if (this.options.dependencies.includes(HealthCheckDependency.AdapterRedis)) {
            healthIndicators.push(async () => this.healthCheckCoreService.pingCheckRedis(RedisType.Adapter))
        }
        if (this.options.dependencies.includes(HealthCheckDependency.JobRedis)) {
            healthIndicators.push(async () => this.healthCheckCoreService.pingCheckRedis(RedisType.Job))
        }
        if (this.options.dependencies.includes(HealthCheckDependency.Kafka)) {
            healthIndicators.push(async () => this.healthCheckCoreService.pingCheckKafka())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.GameplayService)) {
            healthIndicators.push(async () => this.healthCheckContainersService.pingCheckGameplayService())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.GameplaySubgraph)) {
            healthIndicators.push(async () => this.healthCheckContainersService.pingCheckGameplaySubgraph())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.WebsocketNode)) {
            healthIndicators.push(async () => this.healthCheckContainersService.pingCheckWebsocketNode())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.GraphQLGateway)) {
            healthIndicators.push(async () => this.healthCheckContainersService.pingCheckGraphQlGateway())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.RestApiGateway)) {
            healthIndicators.push(async () => this.healthCheckContainersService.pingCheckRestApiGateway())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.CronScheduler)) {
            healthIndicators.push(async () => this.healthCheckContainersService.pingCheckCronScheduler())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.CronWorker)) {
            healthIndicators.push(async () => this.healthCheckContainersService.pingCheckCronWorker())
        }

        // Check all the health indicators
        return this.health.check(healthIndicators)
    }
}
