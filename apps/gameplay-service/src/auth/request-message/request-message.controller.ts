import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RequestMessageService } from "./request-message.service"
import { getGrpcData, GrpcName } from "@src/grpc"
  
@Controller()
export class RequestMessageController {
    private readonly logger = new Logger(RequestMessageController.name)

    constructor(private readonly requestMessageService: RequestMessageService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "RequestMessage")
    public async requestMessage() {
        return this.requestMessageService.requestMessage()
    }
}
