import { Module } from "@nestjs/common"
import { getHttpUrl } from "@src/common"
import { Container, envConfig, EnvModule } from "@src/env"
import { GraphQLGatewayModule } from "@src/graphql"

@Module({
    imports: [
        EnvModule.forRoot(),
        GraphQLGatewayModule.forRoot({
            subgraphs: [
                {
                    name: "gameplay",
                    url: getHttpUrl({
                        host: envConfig().containers[Container.GameplaySubgraph].host,
                        port: envConfig().containers[Container.GameplaySubgraph].port,
                        path: "graphql"
                    })
                }
            ]
        }),
    ],
})
export class AppModule {}
