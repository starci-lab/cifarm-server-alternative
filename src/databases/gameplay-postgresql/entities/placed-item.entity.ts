import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { AnimalInfoEntity } from "./animal-info.entity"
import { BuildingInfoEntity } from "./building-info.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"
import { SeedGrowthInfoEntity } from "./seed-grow-info.entity"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("placed_items")
export class PlacedItemEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "x", type: "int" })
        x: number

    @Field(() => String)
    @Column({ name: "y", type: "int" })
        y: number

    @Field(() => String, { nullable: true })
    @Column({ name: "user_id", nullable: true })
        userId: string

    @Field(() => UserEntity, { nullable: true })
    @ManyToOne(() => UserEntity, (user) => user.inventories, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
        user?: UserEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "inventory_id", type: "uuid", nullable: true })
        inventoryId?: string

    @Field(() => SeedGrowthInfoEntity, { nullable: true })
    @OneToOne(() => SeedGrowthInfoEntity, (seedGrowthInfo) => seedGrowthInfo.placedItem, {
        nullable: true,
        eager: true,
        cascade: true,
        onDelete: "CASCADE"
    })
        seedGrowthInfo?: SeedGrowthInfoEntity

    @Field(() => AnimalInfoEntity, { nullable: true })
    @OneToOne(() => AnimalInfoEntity, (animalInfo) => animalInfo.placedItem, {
        nullable: true,
        eager: true,
        cascade: true,
        onDelete: "CASCADE"
    })
    @JoinColumn()
        animalInfo?: AnimalInfoEntity

    @Field(() => BuildingInfoEntity, { nullable: true })
    @OneToOne(() => BuildingInfoEntity, (buildingInfo) => buildingInfo.placedItem, {
        nullable: true,
        eager: true,
        cascade: true,
        onDelete: "CASCADE"
    })
    @JoinColumn()
        buildingInfo?: BuildingInfoEntity

    @Field(() => [PlacedItemEntity])
    @OneToMany(() => PlacedItemEntity, (placedItem) => placedItem.placedItemType)
        placedItems?: Array<PlacedItemEntity>

    @Field(() => String, { nullable: true })
    @Column({ name: "parent_id", type: "uuid", nullable: true })
        parentId?: string

    @Field(() => String, { nullable: true })
    @ManyToOne(() => PlacedItemEntity, (placedItem) => placedItem.id, { nullable: true })
        parent: PlacedItemEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "placed_item_type_id", length: 36, nullable: true })
        placedItemTypeId?: string

    @Field(() => PlacedItemTypeEntity, { nullable: true })
    @ManyToOne(() => PlacedItemTypeEntity, (placedItemType) => placedItemType.placedItems, {
        onDelete: "CASCADE",
        eager: true
    })
    @JoinColumn({ name: "placed_item_type_id", referencedColumnName: "id" })
        placedItemType?: PlacedItemTypeEntity
}