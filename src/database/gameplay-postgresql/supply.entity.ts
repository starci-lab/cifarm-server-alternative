import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, PrimaryColumn } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { SupplyType } from "./enums"
import { SupplyKey } from "./enums-key"

@ObjectType()
@Entity("supplies")
export class SupplyEntity extends ReadableAbstractEntity {
    @Field(() => SupplyKey)
    @PrimaryColumn({ type: "enum", enum: SupplyKey })
        id: SupplyKey

    @Field(() => SupplyType)
    @Column({ name: "type", type: "enum", enum: SupplyType })
        type: SupplyType

    @Field(() => Float)
    @Column({ name: "price", type: "float" })
        price: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean", default: false })
        availableInShop: boolean

    @Field(() => Int)
    @Column({ name: "maxStack", type: "int", default: 16 })
        maxStack: number

    @Field(() => Int, { nullable: true })
    @Column({ name: "time_reduce", type: "int", nullable: true })
        fertilizerEffectTimeReduce?: number

}
