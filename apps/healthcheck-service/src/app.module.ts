import { Module } from "@nestjs/common"
import { DoHealthcheckModule } from "./do-healthcheck"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
    imports: [
        DoHealthcheckModule,
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "Cuong123_A",
            database: "cifarm",
            autoLoadEntities: true,
            synchronize: true,
        }),
    ],
    controllers: [],
})
export class AppModule {}
