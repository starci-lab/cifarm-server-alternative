import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { HelpUseHerbicideRequest } from "./help-use-herbicide.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HelpUseHerbicideController {
    private readonly logger = new Logger(HelpUseHerbicideController.name)

    constructor(private readonly helpUseHerbicideService: HelpUseHerbicideService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HelpUseHerbicide")
    public async helpUseHerbicide(request: HelpUseHerbicideRequest) {
        this.logger.debug("HelpUseHerbicide request called")
        return this.helpUseHerbicideService.helpUseHerbicide(request)
    }
}
