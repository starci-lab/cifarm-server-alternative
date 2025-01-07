import { Module } from "@nestjs/common"
import { CropsResolver } from "./crops.resolver"
import { CropsService } from "./crops.service"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forFeature() ],
    providers: [CropsService, CropsResolver]
})
export class CropsModule {}
