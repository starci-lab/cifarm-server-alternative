import { Module } from "@nestjs/common"
import { SeedCommand } from "./seed.command"
import { SeedersModule } from "./seeders"
import { PostgreSQLOptionsModule } from "@src/databases"
import {
    MAIN_GAMEPLAY_POSTGRESQL,
    MAIN_TELEGRAM_POSTGRESQL,
    MOCK_GAMEPLAY_POSTGRESQL,
    MOCK_TELEGRAM_POSTGRESQL
} from "./seed.constants"
import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"

@Module({
    imports: [
        PostgreSQLOptionsModule.register({
            injectionToken: MAIN_GAMEPLAY_POSTGRESQL
        }),
        PostgreSQLOptionsModule.register({
            injectionToken: MOCK_GAMEPLAY_POSTGRESQL,
            options: {
                context: PostgreSQLContext.Mock
            }
        }),
        PostgreSQLOptionsModule.register({
            injectionToken: MAIN_TELEGRAM_POSTGRESQL,
            options: {
                database: PostgreSQLDatabase.Telegram
            }
        }),
        PostgreSQLOptionsModule.register({
            injectionToken: MOCK_TELEGRAM_POSTGRESQL,
            options: {
                database: PostgreSQLDatabase.Telegram,
                context: PostgreSQLContext.Mock
            }
        }),
        SeedersModule.register()
    ],
    providers: [SeedCommand]
})
export class SeedModule {}
