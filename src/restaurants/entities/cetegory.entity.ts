import { Restaurant } from "./restaurant.entity"
import { IsString, Length } from "class-validator"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany } from "typeorm"
import { CoreEntity } from "src/common/entities/core.entity"

//typedefs 와 스키마 migration 에 있는 내용이 여기로 들어왔다고 생각하라.

@InputType("CategoryInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  // Name
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5, 10)
  name: string

  // Cover Image
  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string

  // Slug
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  slug: string

  // Restaurants
  @Field((type) => [Restaurant])
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[]
}
