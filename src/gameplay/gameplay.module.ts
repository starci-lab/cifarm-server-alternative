import { DynamicModule, Module } from "@nestjs/common"
import { EnergyService } from "./energy"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./gameplay.module-definition"
import { InventoryService } from "./inventory"
import { LevelService } from "./level"
import { ThiefService } from "./thief"
import { GoldBalanceService, TokenBalanceService } from "./wallet"

@Module({
    providers: [
        LevelService,
        ThiefService,
        EnergyService,
        GoldBalanceService,
        TokenBalanceService,
        InventoryService
    ],
    exports: [
        LevelService,
        ThiefService,
        EnergyService,
        GoldBalanceService,
        TokenBalanceService,
        InventoryService
    ]
})
export class GameplayModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        return super.register(options)
    }
}
