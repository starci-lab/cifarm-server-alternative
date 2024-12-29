import { Global, Module } from "@nestjs/common"
import { EnergyModule, InventoryModule, LevelModule, ThiefModule } from "@src/gameplay"
import { ThiefCropController } from "./thief-crop.controller"
import { TheifCropService } from "./thief-crop.service"
import { GameplayPostgreSQLModule } from "@src/databases"
import { KafkaModule, KafkaGroupId } from "@src/brokers"
import { EnvModule } from "@src/env"

@Global()
@Module({
    imports: [
        EnvModule.forRoot(),
        GameplayPostgreSQLModule.forRoot(),
        KafkaModule.forRoot({
            groupId: KafkaGroupId.PlacedItemsBroadcast,
            producerOnly: true
        }),
        EnergyModule,
        LevelModule,
        ThiefModule,
        InventoryModule
    ],
    providers: [TheifCropService],
    exports: [TheifCropService],
    controllers: [ThiefCropController]
})
export class ThiefCropModule {}
