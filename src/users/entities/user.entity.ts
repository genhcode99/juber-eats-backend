import * as bcrypt from "bcrypt"
import { CoreEntity } from "src/common/entities/core.entity"
import { InternalServerErrorException } from "@nestjs/common"
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm"
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: "UserRole" })

@InputType("UserInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  // Email
  @Column({ unique: true })
  @Field((type) => String)
  @IsEmail()
  email: string

  // Password
  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string

  // Role
  @Column({ type: "enum", enum: UserRole })
  @Field((type) => UserRole)
  @IsEnum(UserRole)
  role: UserRole

  // Verified
  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean

  // Restaurants
  @Field((type) => [Restaurant])
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[]

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
