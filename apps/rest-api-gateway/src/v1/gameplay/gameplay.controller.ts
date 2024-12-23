import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post,
    UseGuards
} from "@nestjs/common"

import {
    BuyAnimalRequest,
    BuyAnimalResponse,
    BuySeedsRequest,
    BuySeedsResponse,
    BuySuppliesRequest,
    BuySuppliesResponse,
    BuyTileRequest,
    BuyTileResponse,
    ClaimDailyRewardRequest,
    ClaimDailyRewardResponse,
    CollectAnimalProductRequest,
    CollectAnimalProductResponse,
    ConstructBuildingRequest,
    ConstructBuildingResponse,
    CureAnimalRequest,
    CureAnimalResponse,
    DeliverProductRequest,
    DeliverProductResponse,
    FeedAnimalRequest,
    FeedAnimalResponse,
    FollowRequest,
    FollowResponse,
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    HarvestCropRequest,
    HarvestCropResponse,
    HelpCureAnimalRequest,
    HelpCureAnimalResponse,
    HelpUseHerbicideRequest,
    HelpUseHerbicideResponse,
    HelpUsePesticideRequest,
    HelpUsePesticideResponse,
    HelpWaterRequest,
    HelpWaterResponse,
    IGameplayService,
    MoveRequest,
    MoveResponse,
    PlaceTileRequest,
    PlaceTileResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    RecoverTileRequest,
    RecoverTileResponse,
    RefreshRequest,
    RefreshResponse,
    RequestMessageResponse,
    RetainProductRequest,
    RetainProductResponse,
    ReturnRequest,
    ReturnResponse,
    SpinRequest,
    SpinResponse,
    ThiefAnimalProductRequest,
    ThiefAnimalProductResponse,
    ThiefCropRequest,
    ThiefCropResponse,
    UnfollowRequest,
    UnfollowResponse,
    UpdateTutorialRequest,
    UpdateTutorialResponse,
    UpgradeBuildingRequest,
    UpgradeBuildingResponse,
    UseFertilizerRequest,
    UseFertilizerResponse,
    UseHerbicideRequest,
    UseHerbicideResponse,
    UsePesticideRequest,
    UsePesticideResponse,
    VerifySignatureRequest,
    VerifySignatureResponse,
    VisitRequest,
    VisitResponse,
    WaterRequest,
    WaterResponse
} from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { User } from "@src/decorators"
import { RestJwtAuthGuard } from "@src/guards"
import { UserLike } from "@src/services"
import { lastValueFrom } from "rxjs"

@ApiTags("Gameplay")
@Controller({
    path: "gameplay",
    version: "1"
})
export class GameplayController implements OnModuleInit {
    private readonly logger = new Logger(GameplayController.name)

    constructor(
        @Inject(grpcConfig[GrpcServiceName.Gameplay].name) private grpcClient: ClientGrpc
    ) {}

    private gameplayService: IGameplayService

    onModuleInit() {
        this.gameplayService = this.grpcClient.getService<IGameplayService>(
            grpcConfig[GrpcServiceName.Gameplay].service
        )
    }

    // Auth
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: RequestMessageResponse })
    @Post("message")
    public async requestMessage(): Promise<RequestMessageResponse> {
        return await lastValueFrom(this.gameplayService.requestMessage({}))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: GenerateTestSignatureResponse
    })
    @Post("test-signature")
    public async generateTestSignature(
        @Body() request: GenerateTestSignatureRequest
    ): Promise<GenerateTestSignatureResponse> {
        return await lastValueFrom(this.gameplayService.generateTestSignature(request))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: VerifySignatureResponse
    })
    @Post("verify-signature")
    public async verifySignature(
        @Body() request: VerifySignatureRequest
    ): Promise<VerifySignatureResponse> {
        return await lastValueFrom(this.gameplayService.verifySignature(request))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: RefreshResponse
    })
    @Post("refresh")
    public async refresh(
        @Body() request: RefreshRequest
    ): Promise<RefreshResponse> {
        return await lastValueFrom(this.gameplayService.refresh(request))
    }

    // Claim
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: ClaimDailyRewardResponse })
    @Post("/claim-daily-reward")
    public async claimDailyReward(
        @User() user: UserLike,
        @Body() request: ClaimDailyRewardRequest
    ): Promise<ClaimDailyRewardResponse> {
        this.logger.debug(`Processing claimDailyReward for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.claimDailyReward({
                ...request,
                userId: user?.id
            })
        )

    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: SpinResponse })
    @Post("/spin")
    public async spin(
        @User() user: UserLike,
        @Body() request: SpinRequest
    ): Promise<SpinResponse> {
        this.logger.debug(`Processing spin for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.spin({
                ...request,
                userId: user?.id
            })
        )
    }

    //Community
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: FollowResponse
    })
    @Post("/follow")
    public async follow(
        @User() user: UserLike,
        @Body() request: FollowRequest
    ): Promise<FollowResponse> {
        this.logger.debug(`Processing user ${user?.id} follow user ${request?.followedUserId}`)
        return await lastValueFrom(
            this.gameplayService.follow({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpCureAnimalResponse
    })
    @Post("/help-cure-animal")
    public async helpCureAnimal(
        @User() user: UserLike,
        @Body() request: HelpCureAnimalRequest
    ): Promise<HelpCureAnimalResponse> {
        this.logger.debug(`Processing user ${user?.id} help cure animal of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.helpCureAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpUseHerbicideResponse
    })
    @Post("/help-use-herbicide")
    public async helpUseHerbicide(
        @User() user: UserLike,
        @Body() request: HelpUseHerbicideRequest
    ): Promise<HelpUseHerbicideResponse> {
        this.logger.debug(`Processing user ${user?.id} help use herbicide of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.helpUseHerbicide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpUsePesticideResponse
    })
    @Post("/help-use-pesiticide")
    public async helpUsePesticide(
        @User() user: UserLike,
        @Body() request: HelpUsePesticideRequest
    ): Promise<HelpUsePesticideResponse> {
        this.logger.debug(`Processing user ${user?.id} help use pesticide of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.helpUsePesticide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HelpWaterResponse
    })
    @Post("/help-water")
    public async helpWater(
        @User() user: UserLike,
        @Body() request: HelpWaterRequest
    ): Promise<HelpWaterResponse> {
        this.logger.debug(`Processing user ${user?.id} help water of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.helpWater({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: ReturnResponse
    })
    @Post("/return")
    public async return(
        @User() user: UserLike,
        @Body() request: ReturnRequest
    ): Promise<ReturnResponse> {
        this.logger.debug(`Processing user ${user?.id} return`)
        return await lastValueFrom(
            this.gameplayService.return({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: ThiefAnimalProductResponse
    })
    @Post("/thief-animal-product")
    public async thiefAnimalProduct(
        @User() user: UserLike,
        @Body() request: ThiefAnimalProductRequest
    ): Promise<ThiefAnimalProductResponse> {
        this.logger.debug(`Processing user ${user?.id} thief animal product of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.thiefAnimalProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: ThiefCropResponse
    })
    @Post("/thief-crop")
    public async thiefCrop(
        @User() user: UserLike,
        @Body() request: ThiefCropRequest
    ): Promise<ThiefCropResponse> {
        this.logger.debug(`Processing user ${user?.id} thief crop of user ${request?.neighborUserId}`)
        return await lastValueFrom(
            this.gameplayService.thiefCrop({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UnfollowResponse
    })
    @Post("/unfollow")
    public async unfollow(
        @User() user: UserLike,
        @Body() request: UnfollowRequest
    ): Promise<UnfollowResponse> {
        this.logger.debug(`Processing user ${user?.id} unfollow user ${request?.unfollowedUserId}`)
        return await lastValueFrom(
            this.gameplayService.unfollow({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: VisitResponse
    })
    @Post("/visit")
    public async visit(
        @User() user: UserLike,
        @Body() request: VisitRequest
    ): Promise<VisitResponse> {
        this.logger.debug(`Processing user ${user?.id} visit`)
        return await lastValueFrom(
            this.gameplayService.visit({
                ...request,
                userId: user?.id
            })
        )
    }


    // Delivery
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: DeliverProductResponse
    })
    @Post("/deliver-product")
    public async deliverProduct(
        @User() user: UserLike,
        @Body() request: DeliverProductRequest
    ): Promise<DeliverProductResponse> {
        this.logger.debug(`Processing deliver product for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.deliverProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: RetainProductResponse
    })
    @Post("/retain-product")
    public async retainProduct(
        @User() user: UserLike,
        @Body() request: RetainProductRequest
    ): Promise<RetainProductResponse> {
        this.logger.debug(`Processing retain product for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.retainProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    //Farming
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: CollectAnimalProductResponse
    })
    @Post("/collect-animal-product")
    public async collectAnimalProduct(
        @User() user: UserLike,
        @Body() request: CollectAnimalProductRequest
    ): Promise<CollectAnimalProductResponse> {
        this.logger.debug(`Processing collect animal product for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.collectAnimalProduct({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: CureAnimalResponse
    })
    @Post("/cure-animal")
    public async cureAnimal(
        @User() user: UserLike,
        @Body() request: CureAnimalRequest
    ): Promise<CureAnimalResponse> {
        this.logger.debug(`Processing cure animal for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.cureAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: FeedAnimalResponse
    })
    @Post("/feed-animal")
    public async feedAnimal(
        @User() user: UserLike,
        @Body() request: FeedAnimalRequest
    ): Promise<FeedAnimalResponse> {
        this.logger.debug(`Processing feed animal for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.feedAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: HarvestCropResponse
    })
    @Post("/harvest-crop")
    public async harvestCrop(
        @User() user: UserLike,
        @Body() request: HarvestCropRequest
    ): Promise<HarvestCropResponse> {
        this.logger.debug(`Processing harvest crop for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.harvestCrop({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: PlantSeedResponse
    })
    @Post("/plant-seed")
    public async plantSeed(
        @User() user: UserLike,
        @Body() request: PlantSeedRequest
    ): Promise<PlantSeedResponse> {
        this.logger.debug(`Processing plant seed for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.plantSeed({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UseFertilizerResponse
    })
    @Post("/use-fertilizer")
    public async useFertilizer(
        @User() user: UserLike,
        @Body() request: UseFertilizerRequest
    ): Promise<UseFertilizerResponse> {
        this.logger.debug(`Processing use fertilizer for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.useFertilizer({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UseHerbicideResponse
    })
    @Post("/use-herbicide")
    public async useHerbicide(
        @User() user: UserLike,
        @Body() request: UseHerbicideRequest
    ): Promise<UseHerbicideResponse> {
        this.logger.debug(`Processing use herbicide for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.useHerbicide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UsePesticideResponse
    })
    @Post("/use-pesticide")
    public async usePesticide(
        @User() user: UserLike,
        @Body() request: UsePesticideRequest
    ): Promise<UsePesticideResponse> {
        this.logger.debug(`Processing use pesticide for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.usePesticide({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: WaterResponse
    })
    @Post("/water")
    public async water(
        @User() user: UserLike,
        @Body() request: WaterRequest
    ): Promise<WaterResponse> {
        this.logger.debug(`Processing water plant for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.water({
                ...request,
                userId: user.id
            })
        )
    }

    // Shop
    
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: BuySeedsResponse
    })
    @Post("/buy-seeds")
    public async buySeeds(
        @User() user: UserLike,
        @Body() request: BuySeedsRequest
    ): Promise<BuySeedsResponse> {
        this.logger.debug(`Processing buy seeds for user ${user?.id}`)

        return await lastValueFrom(
            this.gameplayService.buySeeds({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: BuyAnimalResponse
    })
    @Post("/buy-animal")
    public async buyAnimal(
        @User() user: UserLike,
        @Body() request: BuyAnimalRequest
    ): Promise<BuyAnimalResponse> {
        this.logger.debug(`Processing buyAnimal for user ${user?.id}`)

        return await lastValueFrom(
            this.gameplayService.buyAnimal({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: BuySuppliesResponse
    })
    @Post("/buy-supplies")
    public async buySupplies(
        @User() user: UserLike,
        @Body() request: BuySuppliesRequest
    ): Promise<BuySuppliesResponse> {
        this.logger.debug(`Processing buySupplies for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.buySupplies({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: BuyTileResponse
    })
    @Post("/buy-tile")
    public async buyTile(
        @User() user: UserLike,
        @Body() request: BuyTileRequest
    ): Promise<BuyTileResponse> {
        this.logger.debug(`Processing buyTile for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.buyTile({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: ConstructBuildingResponse
    })
    @Post("/construct-building")
    public async constructBuilding(
        @User() user: UserLike,
        @Body() request: ConstructBuildingRequest
    ): Promise<ConstructBuildingResponse> {
        this.logger.debug(`Processing constructBuilding for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.constructBuilding({
                ...request,
                userId: user?.id
            })
        )
    }

    // Placement
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: MoveResponse
    })
    @Post("/move")
    public async move(
        @User() user: UserLike,
        @Body() request: MoveRequest
    ): Promise<MoveResponse> {
        this.logger.debug(`Processing move for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.move({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: PlaceTileResponse
    })
    @Post("/place-tile")
    public async placeTile(
        @User() user: UserLike,
        @Body() request: PlaceTileRequest
    ): Promise<PlaceTileResponse> {
        this.logger.debug(`Processing place tile for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.placeTile({
                ...request,
                userId: user?.id
            })
        )
    }

    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: PlaceTileResponse
    })
    @Post("/recover-tile")
    public async recoverTile(
        @User() user: UserLike,
        @Body() request: RecoverTileRequest
    ): Promise<RecoverTileResponse> {
        this.logger.debug(`Processing recover tile for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.recoverTile({
                ...request,
                userId: user?.id
            })
        )
    }

    // Profile
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UpdateTutorialResponse
    })
    @Post("/update-tutorial")
    public async updateTutorial(
        @User() user: UserLike,
        @Body() request: UpdateTutorialRequest
    ): Promise<UpdateTutorialResponse> {
        this.logger.debug(`Processing update tutorial for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.updateTutorial({
                ...request,
                userId: user?.id
            })
        )
    }

    // Profile
    @UseGuards(RestJwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: UpgradeBuildingResponse
    })
    @Post("/upgrade-building")
    public async upgradeBuilding(
        @User() user: UserLike,
        @Body() request: UpgradeBuildingRequest
    ): Promise<UpgradeBuildingResponse> {
        this.logger.debug(`Processing upgrade building for user ${user?.id}`)
        return await lastValueFrom(
            this.gameplayService.upgradeBuilding({
                ...request,
                userId: user?.id
            })
        )
    }
}