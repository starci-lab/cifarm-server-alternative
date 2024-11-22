import { Controller, Logger } from "@nestjs/common"
import { GoldService } from "./gold.service"
import { GrpcMethod } from "@nestjs/microservices"
import { userGrpcConstants } from "../../app.constants"
import {
    AddGoldRequest,
    AddGoldResponse,
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    SubtractGoldRequest,
    SubtractGoldResponse
} from "./gold.dto"

@Controller()
export class GoldController {
    private readonly logger = new Logger(GoldController.name)

    constructor(private readonly goldService: GoldService) {}

    @GrpcMethod(userGrpcConstants.SERVICE, "GetGoldBalance")
    async getGoldBalance(request: GetGoldBalanceRequest): Promise<GetGoldBalanceResponse> {
        this.logger.debug(`Received getGoldBalance request for user: ${request.userId}`)
        return this.goldService.getGoldBalance(request)
    }

    @GrpcMethod(userGrpcConstants.SERVICE, "AddGold")
    async addGold(request: AddGoldRequest): Promise<AddGoldResponse> {
        this.logger.debug(
            `Received addGold request for user: ${request.userId} with amount: ${request.golds}`
        )
        return this.goldService.addGold(request)
    }

    @GrpcMethod(userGrpcConstants.SERVICE, "SubtractGold")
    async subtractGold(request: SubtractGoldRequest): Promise<SubtractGoldResponse> {
        this.logger.debug(
            `Received subtractGold request for user: ${request.userId} with amount: ${request.golds}`
        )
        return this.goldService.subtractGold(request)
    }
}
