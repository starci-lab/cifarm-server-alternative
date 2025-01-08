import { Global, Module } from "@nestjs/common"
import { RequestMessageController } from "./request-message.controller"
import { RequestMessageService } from "./request-message.service"
import { CacheModule } from "@src/cache"

@Global()
@Module({
    imports: [CacheModule],
    controllers: [RequestMessageController],
    providers: [RequestMessageService],
    exports: [RequestMessageService]
})
export class RequestMessageModule {}
