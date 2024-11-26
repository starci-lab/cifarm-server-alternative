import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { Empty, UserIdRequest } from "@src/types"

export class UsePestisideRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        placedItemTileId: string
}

export type UsePestisideResponse = Empty
