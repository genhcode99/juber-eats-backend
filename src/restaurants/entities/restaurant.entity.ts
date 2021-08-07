import { Column, Entity, ManyToOne } from "typeorm"
import { IsString, Length } from "class-validator"
import { Field, ObjectType } from "@nestjs/graphql"
import { CoreEntity } from "src/common/entities/core.entity"
import { Category } from "./cetegory.entity"

//typedefs 와 스키마 migration 에 있는 내용이 여기로 들어왔다고 생각하라.

@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  // Name
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string

  // Cover Image
  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string

  // Address
  @Field((type) => String)
  @Column()
  @IsString()
  address: string

  //Category
  @Field((type) => Category)
  @ManyToOne((type) => Category, (category) => category.restaurants)
  category: Category
}
