import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, PlacedItemEntity, UserEntity } from "@src/database"
import { PlacedItemService } from "./placed-item.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([PlacedItemEntity, UserEntity, InventoryEntity])],
    providers: [PlacedItemService],
    exports: [PlacedItemService]
})
export class PlacedItemModule {}
