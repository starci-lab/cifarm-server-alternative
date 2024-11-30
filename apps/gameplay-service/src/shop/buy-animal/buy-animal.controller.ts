import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../app.constants"
import { BuyAnimalRequest } from "./buy-animal.dto"
import { BuyAnimalService } from "./buy-animal.service"

@Controller()
export class BuyAnimalController {
    private readonly logger = new Logger(BuyAnimalController.name)

    constructor(private readonly buyAnimalService: BuyAnimalService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "BuyAnimal")
    public async buyAnimal(request: BuyAnimalRequest) {
        this.logger.debug("BuyAnimal called")
        return this.buyAnimalService.buyAnimal(request)
    }
}
