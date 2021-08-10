import { CoreOutput } from "src/common/dtos/output.dto"
import { OrderItemOption } from "../entities/order-item.entity"
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"

@InputType()
class CreateOrderItemInput {
  // DishId
  @Field((type) => Int)
  dishId: number

  // Option
  @Field((type) => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[]
}

@InputType()
export class CreateOrderInput {
  @Field((type) => Number)
  restaurantId: number

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[]
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
