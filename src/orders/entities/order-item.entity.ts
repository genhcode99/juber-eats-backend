import { Column, Entity, ManyToOne } from "typeorm"
import { CoreEntity } from "src/common/entities/core.entity"
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { Dish, DishChoice } from "src/restaurants/entities/dish.entity"

// OrderItemOption
@InputType("OrderItemOptionInputType", { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field((type) => String)
  name: string

  @Field((type) => DishChoice, { nullable: true })
  choice?: DishChoice

  @Field((type) => Int, { nullable: true })
  extra?: number
}

// Order Item
@InputType("OrderItemInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  // Dish
  @ManyToOne((type) => Dish, { onDelete: "CASCADE" })
  dish: Dish

  // Options
  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: "json", nullable: true })
  options?: OrderItemOption[]
}
