import { ApiProperty } from "@nestjs/swagger"

export class CropsJobData {
    @ApiProperty({ example: 1, description: "From index" })
        from: number
    @ApiProperty({ example: 10, description: "To index" })
        to: number
}