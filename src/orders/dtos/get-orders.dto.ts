import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { CoreOutput } from "src/common/dtos/output.dto"
import { OderStatus, Order } from "../entities/order.entity"

@InputType()
export class GetOrdersInput {
  @Field((type) => OderStatus, { nullable: true })
  status?: OderStatus
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field((type) => [Order], { nullable: true })
  orders?: Order[]
}
