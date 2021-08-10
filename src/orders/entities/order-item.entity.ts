import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { CoreEntity } from "src/common/entities/core.entity"
import { Dish, DishOptions } from "src/restaurants/entities/dish.entity"
import { Column, Entity, ManyToOne } from "typeorm"

@InputType("OrderItemInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @ManyToOne((type) => Dish, { onDelete: "CASCADE" })
  dish: Dish

  // Dish Options
  @Field((type) => [DishOptions], { nullable: true })
  @Column({ type: "json", nullable: true })
  options?: DishOptions[]
}
