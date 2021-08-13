import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm"
import { IsString, Length } from "class-validator"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { CoreEntity } from "src/common/entities/core.entity"
import { Category } from "./cetegory.entity"
import { User } from "src/users/entities/user.entity"
import { Dish } from "./dish.entity"
import { type } from "os"
import { Order } from "src/orders/entities/order.entity"

//typedefs 와 스키마 migration 에 있는 내용이 여기로 들어왔다고 생각하라.
@InputType("RestaurantInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  // Name
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(3)
  name: string

  // Cover Image
  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  coverImg?: string

  // Address
  @Field((type) => String)
  @Column()
  @IsString()
  address: string

  // Category
  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: "SET NULL",
  })
  category: Category

  // Owner
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.restaurants, {
    onDelete: "CASCADE",
  })
  owner: User

  // OwnerId
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number

  // Menu (Relationship)
  @Field((type) => [Dish], { nullable: true })
  @OneToMany((type) => Dish, (dish) => dish.restaurant, {
    onDelete: "SET NULL",
  })
  menu?: Dish[]

  // Orders
  @Field((type) => [Order], { nullable: true })
  @OneToMany((type) => Order, (order) => order.restaurant, {
    onDelete: "SET NULL",
  })
  orders: Order[]
}
