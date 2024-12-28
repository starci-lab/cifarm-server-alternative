import { Global, Module } from "@nestjs/common"
import { InventoryModule, WalletModule } from "@src/services"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        WalletModule,
        InventoryModule
    ],
    providers: [SpinService],
    exports: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}
