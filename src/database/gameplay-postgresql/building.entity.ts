import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany } from "typeorm"
import { AbstractEntity } from "./abstract"
import { AnimalType } from "./enums"
import { BuildingKey } from "./enums-key"
import { UpgradeEntity } from "./upgrade.entity"

@ObjectType()
@Entity("buildings")
export class BuildingEntity extends AbstractEntity {
    @Field(() => BuildingKey)
    @Column({ name: "building_key", type: "enum", enum: BuildingKey })
        buildingKey: BuildingKey

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => AnimalType, { nullable: true })
    @Column({ name: "type", type: "enum", enum: AnimalType, nullable: true })
        type?: AnimalType

    @Field(() => Int)
    @Column({ name: "max_upgrade", type: "int" })
        maxUpgrade: number

    @Field(() => Int, {nullable: true})
    @Column({ name: "price", type: "int", nullable: true })
        price?: number

    @Field(() => [UpgradeEntity], { nullable: true })
    @OneToMany(() => UpgradeEntity, (upgrade) => upgrade.building, { cascade: true, eager: true })
    @JoinColumn()
        upgrades?: Array<UpgradeEntity>
}
