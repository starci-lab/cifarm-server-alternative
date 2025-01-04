import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { TilesService } from "./tiles.service"
import { TileEntity } from "@src/databases"
import { GetTilesArgs } from "./tiles.dto"

@Resolver()
export class TilesResolver {
    private readonly logger = new Logger(TilesResolver.name)

    constructor(private readonly tilesService: TilesService) {}

    @Query(() => [TileEntity], {
        name: "tiles"
    })
    async getTiles(@Args("args") args: GetTilesArgs): Promise<Array<TileEntity>> {
        return this.tilesService.getTiles(args)
    }

    @Query(() => TileEntity, {
        name: "tile",
        nullable:true
    })
    async getTileById(@Args("id") id: string): Promise<TileEntity | null> {
        this.logger.debug(`getTileById: id=${id}`)
        return this.tilesService.getTileById(id)
    }
}
