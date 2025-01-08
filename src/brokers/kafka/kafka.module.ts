import { DynamicModule, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/env"
import { v4 } from "uuid"
import { KAFKA } from "./kafka.constants"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./kafka.module-definition"
import { KafkaGroupId } from "./kafka.types"

@Module({})
export class KafkaModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        const groupId = options.groupId ?? KafkaGroupId.PlacedItemsBroadcast
        const producerOnly = options.producerOnly ?? false
        const dynamicModule = super.register(options)
        const kafkaDynamicModule = ClientsModule.register([
            {
                name: KAFKA,
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: v4(),
                        brokers: [
                            `${envConfig().brokers.kafka.host}:${envConfig().brokers.kafka.port}`
                        ],
                        sasl: envConfig().brokers.kafka.sasl.enabled && {
                            mechanism: "scram-sha-256",
                            username: envConfig().brokers.kafka.sasl.username,
                            password: envConfig().brokers.kafka.sasl.password
                        }
                    },
                    producerOnlyMode: producerOnly,
                    consumer: {
                        groupId: groupId
                    }
                }
            }
        ])
        return {
            ...dynamicModule,
            imports: [
                kafkaDynamicModule
            ],
            exports: [
                kafkaDynamicModule
            ]
        }
    }
}
