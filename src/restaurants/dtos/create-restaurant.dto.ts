import { CoreOutput } from "src/common/dtos/output.dto"
import { Restaurant } from "../entities/restaurant.entity"
import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql"

//dto 는 여러개의 args 를 넣을 때 주로 많들어서 사용하는 것 같다. 엔티티에서 가져와서 만듦 ! 엔티티만 변경하면 모든게 변경됨
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  "name",
  "coverImg",
  "address",
]) {
  @Field((type) => String)
  categoryName: string
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
