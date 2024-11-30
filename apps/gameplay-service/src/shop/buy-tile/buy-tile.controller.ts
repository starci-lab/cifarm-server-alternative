import { Body, Controller, Logger } from "@nestjs/common"
import { BuyTileService } from "./buy-tile.service"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"

@Controller()
export class BuyTileController {
    private readonly logger = new Logger(BuyTileController.name)

    constructor(private readonly buyTileService: BuyTileService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "BuyTile")
    public async buyTile(@Body() request: BuyTileRequest): Promise<BuyTileResponse> {
        this.logger.log(`Received request to buy tile: ${JSON.stringify(request)}`)
        return await this.buyTileService.buyTile(request)
    }
}
