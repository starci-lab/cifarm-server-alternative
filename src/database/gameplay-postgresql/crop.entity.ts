import { ObjectType, Field, Int } from "@nestjs/graphql"
import { Entity, Column, OneToOne, JoinColumn } from "typeorm"
import { AbstractEntity } from "./abstract"
import { ProductEntity } from "./product.entity"
import { CropKey } from "./enums-key"

@ObjectType()
@Entity("crops")
export class CropEntity extends AbstractEntity {
    @Field(() => CropKey)
    @Column({ type: "enum", enum: CropKey })
        key: CropKey

    @Field(() => Int)
    @Column({ name: "growth_stage_duration", type: "bigint" })
        growthStageDuration: number

    @Field(() => Int)
    @Column({ name: "growth_stages", type: "int" })
        growthStages: number

    @Field(() => Int)
    @Column({ name: "price", type: "bigint" })
        price: number

    @Field(() => Boolean)
    @Column({ name: "premium", type: "boolean" })
        premium: boolean

    @Field(() => Boolean)
    @Column({ name: "perennial", type: "boolean" })
        perennial: boolean

    @Field(() => Int)
    @Column({ name: "next_growth_stage_after_harvest", type: "int" })
        nextGrowthStageAfterHarvest: number

    @Field(() => Int)
    @Column({ name: "min_harvest_quantity", type: "int" })
        minHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "max_harvest_quantity", type: "int" })
        maxHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "basic_harvest_experiences", type: "int" })
        basicHarvestExperiences: number

    @Field(() => Int)
    @Column({ name: "premium_harvest_experiences", type: "int" })
        premiumHarvestExperiences: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => Int)
    @Column({ name: "maxStack", type: "int", default: 16 })
        maxStack: number

    @OneToOne(() => ProductEntity, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn()
        product: ProductEntity
}