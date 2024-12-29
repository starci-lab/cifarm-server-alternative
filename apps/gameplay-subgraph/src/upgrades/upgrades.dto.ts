import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"

@InputType({
    description: "GetUpgradesArgs"
})
export class GetUpgradesArgs extends PaginatedArgs {}
