import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { shopGrpcConstants } from "../constants"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { BuySeedsService } from "./buy-seeds.service"

@Controller()
export class BuySeedsController {
    private readonly logger = new Logger(BuySeedsController.name)

    constructor(private readonly buySeedService: BuySeedsService) {}

    @GrpcMethod(shopGrpcConstants.SERVICE, "BuySeeds")
    public async buySeed(request: BuySeedsRequest) {
        this.logger.debug("BuySeed called")
        return this.buySeedService.buySeeds(request)
    }
}