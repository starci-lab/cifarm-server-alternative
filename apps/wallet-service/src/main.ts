import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/config"
import { walletGrpcConstants } from "./constants"

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `${envConfig().containers.walletService.host}:${envConfig().containers.walletService.port}`,
            package: walletGrpcConstants.PACKAGE,
            protoPath: walletGrpcConstants.PROTO_PATH
        }
    })

    await app.listen()
}
bootstrap()