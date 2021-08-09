import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IsNumber, IsString, Length } from "class-validator"
import { CoreEntity } from "src/common/entities/core.entity"
import { Column, Entity, ManyToOne, RelationId } from "typeorm"
import { Restaurant } from "./restaurant.entity"

@InputType("DishInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  // Name
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(3)
  name: string

  // Price
  @Field((type) => Number)
  @Column()
  @IsNumber()
  price: number

  // Photo
  @Field((type) => String)
  @Column()
  @IsString()
  photo: string

  // Description
  @Field((type) => String)
  @Column()
  @Length(5, 140)
  description: string

  // Restaurant
  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: "CASCADE",
  })
  restaurant: Restaurant

  // RestaurantId
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number
}
