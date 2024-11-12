import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"

export class UserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "5a6919c3-6ae3-45de-81eb-f1bbb05a246d" })
        userId: string
}