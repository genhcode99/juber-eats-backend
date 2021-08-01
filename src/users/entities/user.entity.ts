import * as bcrypt from "bcrypt"
import { BeforeInsert, Column, Entity } from "typeorm"
import { CoreEntity } from "src/common/entities/core.entity"
import { InternalServerErrorException } from "@nestjs/common"
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: "UserRole" })

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field((type) => String)
  email: string

  @Column()
  @Field((type) => String)
  password: string

  @Column({ type: "enum", enum: UserRole })
  @Field((type) => UserRole)
  role: UserRole

  @BeforeInsert()
  async hashPassword() {
    try {
      this.password = await bcrypt.hash(this.password, 10)
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException()
    }
  }
}
