import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"

export interface PostgreSQLOptions {
    context?: PostgreSQLContext
    database?: PostgreSQLDatabase
    cacheEnabled?: boolean
    synchronize?: boolean
}
