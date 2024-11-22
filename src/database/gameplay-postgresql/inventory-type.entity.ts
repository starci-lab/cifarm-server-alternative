import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { CropEntity } from "./crop.entity"
import { InventoryType } from "./enums"
import { InventoryEntity } from "./inventory.entity"
import { ProductEntity } from "./product.entity"
import { SupplyEntity } from "./supply.entity"
import { TileEntity } from "./tile.entity"

@ObjectType()
@Entity("inventory_types")
export class InventoryTypeEntity extends ReadableAbstractEntity {
    @Field(() => InventoryType)
    @Column({ name: "type", type: "enum", enum: InventoryType })
    type: InventoryType

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "placeable", type: "boolean", default: false })
    placeable: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "deliverable", type: "boolean", default: false })
    deliverable: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "as_tool", type: "boolean", default: false })
    asTool: boolean

    @Field(() => Number, { defaultValue: 16 })
    @Column({ name: "max_stack", type: "int", default: 16 })
    maxStack: number

    @OneToOne(() => CropEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "crop_id",
        referencedColumnName: "id"
    })
    crop: CropEntity

    @OneToOne(() => AnimalEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "animal_id",
        referencedColumnName: "id"
    })
    animal: AnimalEntity

    @OneToOne(() => SupplyEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "supply_id",
        referencedColumnName: "id"
    })
    supply: SupplyEntity

    @OneToOne(() => ProductEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "product_id",
        referencedColumnName: "id"
    })
    product: ProductEntity

    @OneToOne(() => TileEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "tile_id",
        referencedColumnName: "id"
    })
    tile: TileEntity

    @Field(() => [InventoryEntity], { nullable: true })
    @OneToMany(() => InventoryEntity, (inventory) => inventory.inventoryType, {
        cascade: ["insert", "update"]
    })
    inventories?: Array<InventoryEntity>
}