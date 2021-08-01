import { Column, Entity } from "typeorm"
import { CoreEntity } from "src/common/entities/core.entity"
import { Field, InputType, ObjectType } from "@nestjs/graphql"

type UserRole = "client" | "owner" | "delivery"

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  email: string

  @Column()
  @Field(() => String)
  password: string

  @Column()
  @Field(() => String)
  role: UserRole
}
