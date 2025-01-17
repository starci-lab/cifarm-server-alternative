import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("inventories")
export class InventoryEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "quantity", type: "int", default: 1 })
        quantity: number

    @Field(() => String, { nullable: true })
    @Column({ name: "token_id", type: "varchar", length: 100, nullable: true })
        tokenId?: string

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "premium", type: "boolean", default: false })
        premium: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "is_placed", type: "boolean", default: false })
        isPlaced: boolean

    @Field(() => String, { nullable: true })
    @Column({ name: "user_id", nullable: true })
        userId: string

    @Field(() => UserEntity, { nullable: true })
    @ManyToOne(() => UserEntity, (user) => user.inventories, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
        user?: UserEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "inventory_type_id", nullable: true })
        inventoryTypeId: string

    @Field(() => InventoryTypeEntity)
    @ManyToOne(
        () => InventoryTypeEntity,
        (inventoryType: InventoryTypeEntity) => inventoryType.inventories,
        { onDelete: "SET NULL" }
    )
    @JoinColumn({ name: "inventory_type_id", referencedColumnName: "id" })
        inventoryType: InventoryTypeEntity
}
