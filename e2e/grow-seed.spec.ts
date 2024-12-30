//npx jest --config ./e2e/jest.json ./e2e/grow-seed.spec.ts

import { Test } from "@nestjs/testing"
import { CropCurrentState, CropEntity, CropId, GameplayPostgreSQLModule, InventoryEntity, InventoryType, PlacedItemEntity, PlacedItemType, SeedGrowthInfoEntity, TileId, UserEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { lastValueFrom } from "rxjs"
import { sleep } from "@src/common/utils"
import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { EnvModule } from "@src/env"
import { grpcData, GrpcModule } from "@src/grpc"
import { GrpcServiceName } from "@src/grpc/grpc.types"
import { Network, SupportedChainKey } from "@src/blockchain"
import { createAxios } from "./e2e.utils"
import { JwtModule, JwtService, UserLike } from "@src/jwt"

describe("Grow seed flow", () => {
    let accessToken: string
    let dataSource: DataSource
    let user: UserLike
    let jwtService: JwtService
    let gameplayService: IGameplayService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                EnvModule.forRoot(),
                GameplayPostgreSQLModule.forRoot(),
                GrpcModule.forRoot({
                    name: GrpcServiceName.Gameplay
                }),
                JwtModule
            ],
        }).compile()

        // Sign in and retrieve accessToken
        const authAxios = createAxios("no-auth", { version: "v1" })
        const { data } = await authAxios.post("/test-signature", {
            chainKey: SupportedChainKey.Aptos,
            accountNumber: 2,
            network: Network.Mainnet,
        })
        const { data: verifySignatureData } = await authAxios.post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcData[GrpcServiceName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(grpcData[GrpcServiceName.Gameplay].service)

        // Decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)
    })

    it("Should grow seed successfully", async () => {
        // Test with carrot
        const cropId: CropId = CropId.Carrot
        const axios = createAxios("with-auth", { version: "v1", accessToken })

        // Buy seeds from the shop
        await axios.post("/buy-seeds", {
            cropId,
            quantity: 1
        })

        // Get the inventory
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

        // Get the first tile
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

        // Plant the seed
        await axios.post("/plant-seed", {
            inventorySeedId,
            placedItemTileId
        })

        // Speed up the growth for each stage and perform checks
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: {
                id: cropId
            }
        })

        for (let stage = 2; stage <= crop.growthStages; stage++) {
            await lastValueFrom(gameplayService.speedUp({
                time: crop.growthStageDuration
            }))
            await sleep(1100)

            // Retrieve the growth info
            const seedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
                where: {
                    placedItemId: placedItemTileId
                }
            })

            // Assert the current growth stage
            expect(seedGrowthInfo.currentStage).toBe(stage)

            if (seedGrowthInfo.currentState === CropCurrentState.NeedWater) {
                await axios.post("/water", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsWeedy) {
                await axios.post("/use-herbicide", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsInfested) {
                await axios.post("/use-pesticide", { placedItemTileId })
            }

            // Ensure the crop is in a normal state
            const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
                where: {
                    id: seedGrowthInfo.id
                }
            })

            expect(updatedSeedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
        }

        // Final assertion: Crop should be fully matured
        const finalSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                placedItemId: placedItemTileId
            }
        })
        expect(finalSeedGrowthInfo.currentStage).toBe(CropCurrentState.FullyMatured)
    })

    afterAll(async () => {
        await dataSource.manager.delete(UserEntity, user.id)
    })
})
