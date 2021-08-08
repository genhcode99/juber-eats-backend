import { CoreOutput } from "src/common/dtos/output.dto"
import { CreateRestaurantInput } from "./create-restaurant.dto"
import { InputType, ObjectType, PartialType } from "@nestjs/graphql"

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
