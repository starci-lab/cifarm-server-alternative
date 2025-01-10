import { Module } from "@nestjs/common"
import { RefreshModule } from "./refresh"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"
import { GenerateSignatureModule } from "./generate-signature"
import { BlockchainModule } from "@src/blockchain"

@Module({
    imports: [
        BlockchainModule.register({
            isGlobal: true
        }),
        GenerateSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        RefreshModule,
    ]
})
export class AuthModule {}
