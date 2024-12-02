import { ClientsModule, Transport } from "@nestjs/microservices"
import { KafkaConfigKey, kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"

export interface KafkaClientRegisterParams {
    key: KafkaConfigKey
    producerOnlyMode?: boolean
}
export const kafkaClientRegister = ({ key, producerOnlyMode = false }: KafkaClientRegisterParams) => {
    return ClientsModule.register([
        {
            name: kafkaConfig[key].name,
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: v4(),
                    brokers: Object.values(envConfig().kafka.brokers)
                },
                producerOnlyMode,
                consumer: {
                    groupId: kafkaConfig[key].groupId
                }
            }
        }
    ])
}
