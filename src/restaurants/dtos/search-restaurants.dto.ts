import {
  PaginationInput,
  PaginationOutput,
} from "src/common/dtos/pagination.dto"
import { Restaurant } from "../entities/restaurant.entity"
import { Field, InputType, ObjectType } from "@nestjs/graphql"

@InputType()
export class SearchRestaurantsInput extends PaginationInput {
  @Field((type) => String)
  query: string
}

@ObjectType()
export class SearchRestaurantsOutput extends PaginationOutput {
  @Field((type) => [Restaurant], { nullable: true })
  results?: Restaurant[]
}
