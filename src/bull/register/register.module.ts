import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { BullRegisterOptions } from "../bull.types"
import { bullData } from "../bull.constants"

@Module({})
export class RegisterModule {
    public static forRoot(options: BullRegisterOptions) {
        return {
            module: RegisterModule,
            imports: [
                BullModule.registerQueue({
                    name: bullData[options.queueName].name
                })
            ],
            providers: [],
            exports: []
        }
    }
}