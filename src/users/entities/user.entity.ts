import * as bcrypt from "bcrypt"
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator"
import { CoreEntity } from "src/common/entities/core.entity"
import { InternalServerErrorException } from "@nestjs/common"
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm"
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
  @Column({ unique: true })
  @Field((type) => String)
  @IsEmail()
  email: string

  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string

  @Column({ type: "enum", enum: UserRole })
  @Field((type) => UserRole)
  @IsEnum(UserRole)
  role: UserRole

  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10)
      } catch (e) {
        console.log(e)
        throw new InternalServerErrorException()
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password)
      return ok
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }
}
