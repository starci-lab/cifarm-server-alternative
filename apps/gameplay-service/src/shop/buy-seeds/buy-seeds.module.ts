import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalInfoEntity,
    BuildingInfoEntity,
    CropEntity,
    InventoryEntity,
    PlacedItemEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    UserEntity
} from "@src/database"
import { BuySeedsController } from "./buy-seeds.controller"
import { BuySeedsService } from "./buy-seeds.service"
import { InventoryService } from "@src/services"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            CropEntity,
            ProductEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ])
    ],
    providers: [BuySeedsService, InventoryService],
    exports: [BuySeedsService],
    controllers: [BuySeedsController]
})
export class BuySeedsModule {}
