import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { UpdateWalletRequest, UpdateWalletResponse } from "./update-wallet.dto"
import { DataSource } from "typeorm"
import { UserEntity } from "@src/database"
import { RpcException } from "@nestjs/microservices"

// 1 - item id.
@Injectable()
export class UpdateWalletService {
    private readonly logger = new Logger(UpdateWalletService.name)

    constructor(private readonly dataSource: DataSource) {}
    //update golds, tokens
    //add, decrease
    //get balance 
    public async updateWallet(request: UpdateWalletRequest): Promise<UpdateWalletResponse> {
        try {
            this.logger.debug(
                `Processing wallet update for userId: ${request.userId} with goldAmount: ${request.goldAmount}, tokenAmount: ${request.tokenAmount}`
            )

            // Find the user by userId
            const user = await this.dataSource.manager.findOne(UserEntity, { where: { id: request.userId } })
            if (!user) {
                this.logger.debug(`User with ID ${request.userId} not found`)
                throw new NotFoundException("User not found")
            }

            // Update user wallet fields
            if (request.goldAmount !== undefined && request.goldAmount > 0) {
                user.golds = Number(request.goldAmount)
            }
            
            if (request.tokenAmount !== undefined && request.tokenAmount > 0) {
                user.tokens = request.tokenAmount
            }
            

            await this.dataSource.manager.save(user)
            this.logger.debug(`Wallet updated successfully for userId: ${request.userId}`)

            return { message: "Wallet updated successfully" }

        } catch (error) {
            this.logger.debug(`Failed to update wallet for userId: ${request.userId}`, error.message)
            
            if (error instanceof NotFoundException) {
                throw new RpcException(error.message)
            }

            throw new RpcException("An error occurred while updating the wallet")
        }
    }
}
