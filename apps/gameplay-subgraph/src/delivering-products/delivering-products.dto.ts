import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/graphql"

@InputType()
export class GetDeliveringProductsArgs extends PaginatedArgs {}
