import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { grpcConfig, GrpcServiceName } from "@src/config"

@Controller()
export class UpgradeBuildingController {
    private readonly logger = new Logger(UpgradeBuildingController.name)

    constructor(private readonly UpgradeBuildingService: UpgradeBuildingService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "UpgradeBuilding")
    public async upgradeBuilding(
        @Body() request: UpgradeBuildingRequest
    ): Promise<UpgradeBuildingResponse> {
        this.logger.debug(`Received request to upgrade building: ${JSON.stringify(request)}`)
        return await this.UpgradeBuildingService.upgradeBuilding(request)
    }
}