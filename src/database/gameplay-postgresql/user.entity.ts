import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Network, SupportedChainKey } from "@src/config"
import { Column, Entity, OneToMany } from "typeorm"
import { AbstractEntity } from "./abstract"
import { InventoryEntity } from "./inventory.entity"
import { PlacedItemEntity } from "./placed-item.entity"

@ObjectType()
@Entity("users")
export class UserEntity extends AbstractEntity {
    @Field(() => String)
    @Column({ name: "username", type: "varchar", length: 50 })
        username: string

    @Field(() => String)
    @Column({ name: "chainKey", type: "varchar", length: 50 })
        chainKey: SupportedChainKey

    @Field(() => String)
    @Column({ name: "network", type: "varchar", length: 50 })
        network: Network

    @Field(() => String)
    @Column({ name: "account_address", type: "varchar", length: 100 })
        accountAddress: string

    @Field(() => Int)
    @Column({ name: "golds", type: "int4", default: 0 })
        golds: number

    @Field(() => Float)
    @Column({ name: "tokens", type: "float", default: 0 })
        tokens: number

    @Field(() => Int)
    @Column({ name: "experiences", type: "int", default: 0 })
        experiences: number

    @Field(() => Int)
    @Column({ name: "energy", type: "int", default: 0 })
        energy: number

    @Field(() => Int)
    @Column({ name: "level", type: "int", default: 1 })
        level: number

    @Field(() => Int)
    @Column({ name: "tutorial_index", type: "int", default: 0 })
        tutorialIndex: number

    @Field(() => Int)
    @Column({ name: "step_index", type: "int", default: 0 })
        stepIndex: number

    @Field(() => Int)
    @Column({ name: "daily_reward_streak", type: "int", default: 0 })
        dailyRewardStreak: number

    @Field(() => Int)
    @Column({ name: "daily_reward_last_claim_time", type: "int", default: 0 })
        dailyRewardLastClaimTime: number

    @Field(() => Int)
    @Column({ name: "daily_reward_number_of_claim", type: "int", default: 0 })
        dailyRewardNumberOfClaim: number

    @Field(() => Int)
    @Column({ name: "spin_last_time", type: "int", default: 0 })
        spinLastTime: number

    @Field(() => Int)
    @Column({ name: "spin_count", type: "int", default: 0 })
        spinCount: number

    @Field(() => Boolean)
    @Column({ name: "has_completed_first_auth", type: "boolean", default: false })
        hasCompletedFirstAuth: boolean

    @Field(() => [InventoryEntity])
    @OneToMany(() => InventoryEntity, (inventory) => inventory.user)
        inventories?: Array<InventoryEntity>

    @Field(() => [PlacedItemEntity])
    @OneToMany(() => PlacedItemEntity, (inventory) => inventory.user)
        placedItems?: Array<PlacedItemEntity>
}
