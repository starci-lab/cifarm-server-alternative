import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { UpdateTutorialService } from "./update-tutorial.service"
import { UpdateTutorialRequest } from "./update-tutorial.dto"

@Controller()
export class UpdateTutorialController {
    private readonly logger = new Logger(UpdateTutorialController.name)

    constructor(private readonly updateTutorialService: UpdateTutorialService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "UpdateTutorial")
    public async updateTutorial(request: UpdateTutorialRequest) {
        this.logger.debug("UpdateTutorial called")
        return this.updateTutorialService.updateTutorial(request)
    }
}
