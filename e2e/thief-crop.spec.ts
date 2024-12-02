//npx jest --config ./e2e/jest.json ./e2e/thief-crop.spec.ts

import { IGameplayService } from "@apps/gameplay-service"
import { sleep } from "@src/utils"
import { ClientGrpc } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import {
    authAxios,
    gameplayAxios,
    grpcConfig,
    GrpcServiceName,
    Network,
    SupportedChainKey
} from "@src/config"
import {
    CropCurrentState,
    CropEntity,
    CropId,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    PlacedItemType,
    ProductType,
    SeedGrowthInfoEntity,
    TileId,
    UserEntity
} from "@src/database"
import {
    configForRoot,
    grpcClientRegisterAsync,
    typeOrmForFeature,
    typeOrmForRoot
} from "@src/dynamic-modules"
import { JwtModule, JwtService, UserLike } from "@src/services"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { console } from "inspector"

describe("Theif crop flow", () => {
    let user: UserLike
    let accessToken: string
    
    let theifUser: UserLike
    let theifAccessToken: string

    let dataSource: DataSource
    let jwtService: JwtService
    let gameplayService: IGameplayService
    
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                configForRoot(),
                typeOrmForRoot(),
                typeOrmForFeature(),
                grpcClientRegisterAsync(GrpcServiceName.Gameplay),
                JwtModule
            ]
        }).compile()

        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcConfig[GrpcServiceName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(grpcConfig[GrpcServiceName.Gameplay].service)

        //sign in
        //get mesasge
        const { data } = await authAxios().post("/test-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet
        })
        const { data: verifySignatureData } = await authAxios().post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        //decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)


        //sign in theif
        const { data: dataTheif } = await authAxios().post("/test-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet
        })
        const { data: verifySignatureDataTheif } = await authAxios().post("/verify-signature", dataTheif)
        accessToken = verifySignatureDataTheif.accessToken

        theifAccessToken = verifySignatureDataTheif.accessToken
        theifUser = await jwtService.decodeToken(theifAccessToken)
    })

    it("Should theif flow success", async () => {
        //test with carrot
        const cropId: CropId = CropId.Carrot

        const axios = gameplayAxios(accessToken)

        //buy seeds from the shop
        await axios.post("/buy-seeds", {
            cropId,
            quantity: 1
        })

        //get the inventory
        const { id: inventorySeedId } = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Seed,
                    cropId
                }
            },
            relations: {
                inventoryType: true
            }
        })
        //get the first tile
        const { id: placedItemTileId } = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                userId: user.id,
                placedItemType: {
                    tile: {
                        id: TileId.StarterTile
                    },
                    type: PlacedItemType.Tile
                }
            },
            relations: {
                placedItemType: {
                    tile: true
                },
            }
        })

        //plant the seed
        await axios.post("/plant-seed", {
            inventorySeedId,
            placedItemTileId
        })

        //get crop carrot
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: {
                id: cropId
            }
        })

        // speed & sleep 1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(1100)

        //retrive the seed growth info
        const { seedGrowthInfo } = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                id: placedItemTileId
            },
            relations: {
                seedGrowthInfo: true
            }
        })

        //check if crop at stage 2
        const seedGrowthInfoInitialCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoInitialCheck.currentStage).toBe(2)

        //if need water, we than water the crop
        if (seedGrowthInfoInitialCheck.currentState === CropCurrentState.NeedWater) {
            console.log("Watering the crop at stage 2")
            await axios.post("/water", {
                placedItemTileId
            })
        }

        //then, make sure the crop is normal
        const seedGrowthInfoSecondCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoSecondCheck.currentState).toBe(CropCurrentState.Normal)

        // speed & sleep 1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(1100)

        //retrive the seed growth info
        const seedGrowthInfoThirdCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoThirdCheck.currentStage).toBe(3)

        //if need water, we than water the crop
        if (seedGrowthInfoThirdCheck.currentState === CropCurrentState.NeedWater) {
            console.log("Watering the crop at stage 3")
            await axios.post("/water", {
                placedItemTileId
            })
        }
        const seedGrowthInfoForthCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoForthCheck.currentState).toBe(CropCurrentState.Normal)

        // speed & sleep 1.1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(1100)

        //retrive the seed growth info
        const seedGrowthInfoFifthCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoFifthCheck.currentStage).toBe(4)

        //if infested, we than use pesticide
        if (seedGrowthInfoFifthCheck.currentState === CropCurrentState.IsInfested) {
            console.log("Using pesticide on the crop at stage 4")
            await axios.post("/use-pesticide", {
                placedItemTileId
            })
        } 
        //if weedy, we than use herbicide
        else if (seedGrowthInfoFifthCheck.currentState === CropCurrentState.IsWeedy) {
            console.log("Using herbicide on the crop at stage 4")
            await axios.post("/use-herbicide", {
                placedItemTileId
            })
        }
        //then, make sure the crop is normal
        const seedGrowthInfoSixthCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoSixthCheck.currentState).toBe(CropCurrentState.Normal)

        // speed & sleep 1.1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(1100)

        //now, the crop is ready to be harvested
        const seedGrowthInfoSeventhCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoSeventhCheck.fullyMatured).toBe(true) 

        //create theif axios
        const theifAxios = gameplayAxios(theifAccessToken)

        //process theif
        const { data: theifCropResponseData } = await theifAxios.post("/theif-crop", {
            placedItemTileId,
            neighborUserId: user.id
        })

        //make sure the crop is stolen
        const seedGrowthInfoEightCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            },
            relations: {
                crop: true
            }
        })
        expect(seedGrowthInfoEightCheck.harvestQuantityRemaining).toBe(seedGrowthInfoEightCheck.crop.maxHarvestQuantity - theifCropResponseData.quantity)
        //get the inventory of the theif
        const theifInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: theifUser.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Crop,
                        cropId
                    },
                }
            }
        })

        expect(theifInventory.quantity).toBe(theifCropResponseData.quantity)
    })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, user)
        await dataSource.manager.remove(UserEntity, theifUser)
    })
})