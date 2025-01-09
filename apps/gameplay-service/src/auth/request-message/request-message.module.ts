import { Module } from "@nestjs/common"
import { RequestMessageController } from "./request-message.controller"
import { RequestMessageService } from "./request-message.service"

 
@Module({
    imports: [],
    controllers: [RequestMessageController],
    providers: [RequestMessageService],
    exports: [RequestMessageService]
})
export class RequestMessageModule {}
