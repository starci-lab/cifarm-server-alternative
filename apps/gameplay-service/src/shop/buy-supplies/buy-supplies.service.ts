// buy-supplies.service.ts

import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { SupplyEntity } from "@src/database"
import {
    SupplyNotAvailableInShopException,
    SupplyNotFoundException,
    UserInsufficientGoldException
} from "@src/exceptions"
import { GoldBalanceService, InventoryService } from "@src/services"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { BuySuppliesRequest, BuySuppliesResponse } from "./buy-supplies.dto"

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buySupplies(request: BuySuppliesRequest): Promise<BuySuppliesResponse> {
        this.logger.debug(
            `Buying supply for user ${request.userId} id: ${request.id} quantity: ${request.quantity}`
        )

        const supply: SupplyEntity = await this.dataSource.manager.findOne(SupplyEntity, {
            where: { id: request.id }
        })

        if (!supply) throw new SupplyNotFoundException(request.id)
        if (!supply.availableInShop) {
            throw new SupplyNotAvailableInShopException(request.id)
        }

        // Calculate total cost
        const totalCost = supply.price * request.quantity

        // Check Balance
        const balance = await this.goldBalanceService.getGoldBalance({ userId: request.userId })
        if (balance.golds < totalCost)
            throw new UserInsufficientGoldException(balance.golds, totalCost)

        await this.goldBalanceService.subtractGold({ userId: request.userId, golds: totalCost })
        await this.inventoryService.addInventory({
            userId: request.userId,
            inventory: {
                inventoryType: {
                    id: request.id
                },
                quantity: request.quantity
            }
        })

        return
    }
}
