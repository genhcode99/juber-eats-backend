import { User } from "../entities/user.entity"
import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql"
import { CoreOutput } from "src/common/dtos/output.dto"

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ["email", "password"]),
) {}
