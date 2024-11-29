import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, OneToOne } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { CropEntity } from "./crop.entity"
import { ProductType } from "./enums"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { DeliveringProductEntity } from "./delivering-product.entity"

@ObjectType()
@Entity("products")
export class ProductEntity extends StringAbstractEntity {
    @Field(() => Boolean)
    @Column({ name: "is_premium", type: "boolean" })
        isPremium: boolean

    @Field(() => Int)
    @Column({ name: "gold_amount", type: "int" })
        goldAmount: number

    @Field(() => Float)
    @Column({ name: "token_amount", type: "float" })
        tokenAmount: number

    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: ProductType })
        type: ProductType

    @Field(() => CropEntity, { nullable: true })
    @OneToOne(() => CropEntity, (crop) => crop.product, {
        nullable: true,
        onDelete: "CASCADE"
    })
        crop?: CropEntity

    @Field(() => AnimalEntity, { nullable: true })
    @OneToOne(() => AnimalEntity, (animal) => animal.product, {
        nullable: true,
        onDelete: "CASCADE"
    })
        animal?: AnimalEntity

    @Field(() => InventoryTypeEntity, { nullable: true })
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.product, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        inventoryType?: InventoryTypeEntity

    @Field(() => [DeliveringProductEntity])
    @OneToMany(() => DeliveringProductEntity, (deliveringProduct) => deliveringProduct.product)
        deliveringProducts?: Array<DeliveringProductEntity>
}
