import { ConfigurableModuleBuilder } from "@nestjs/common"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder()
        .setExtras(
            {
                isGlobal: false
            },
            (definition, extras) => {
                return {
                    ...definition,
                    global: extras.isGlobal
                }
            }
        )
        .build()