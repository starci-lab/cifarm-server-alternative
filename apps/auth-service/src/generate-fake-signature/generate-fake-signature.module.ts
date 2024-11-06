import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"
import { GenerateFakeSignatureService } from "./generate-fake-signature.service"
import { RequestMessageService } from "../request-message"
import {
    AlgorandAuthService,
    AptosAuthService,
    EvmAuthService,
    NearAuthService,
    PolkadotAuthService,
    SolanaAuthService,
} from "@src/services"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([HealthcheckEntity])],
    controllers: [],
    providers: [
        EvmAuthService,
        SolanaAuthService,
        AptosAuthService,
        NearAuthService,
        AlgorandAuthService,
        PolkadotAuthService,
        RequestMessageService,
        GenerateFakeSignatureService,
    ],
    exports: [GenerateFakeSignatureService],
})
export class GenerateFakeSignatureModule {}
