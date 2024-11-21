import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, PlacedItemEntity, UserEntity } from "@src/database"
import { VerifySignatureService } from "./verify-signature.service"
import { SeedGrowthInfoEntity } from "@src/database/gameplay-postgresql/seed-grow-info.entity"
import { AnimalInfoEntity } from "@src/database/gameplay-postgresql/animal-info.entity"
import { BuildingInfoEntity } from "@src/database/gameplay-postgresql/building-info.entity"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ])
    ],
    controllers: [],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
