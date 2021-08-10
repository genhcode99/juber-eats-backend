import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql"
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm"
import { User } from "src/users/entities/user.entity"
import { CoreEntity } from "src/common/entities/core.entity"
import { Dish } from "src/restaurants/entities/dish.entity"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"

export enum OderStatus {
  Pending = "Pending",
  Cooking = "Cooking",
  PickedUp = "PickedUp",
  Delivered = "Delivered",
}

registerEnumType(OderStatus, { name: "OderStatus" })

@InputType("OrderInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: "SET NULL",
  })
  customer?: User

  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.rides, {
    onDelete: "SET NULL",
  })
  driver?: User

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: "SET NULL",
  })
  restaurant: Restaurant

  // Many to Many 에서 JoinTable 은 owning side에 한번만 사용한다.
  @Field((type) => [Dish])
  @ManyToMany((type) => Dish)
  @JoinTable()
  dishes: Dish[]

  @Field((type) => Float, { nullable: true })
  @Column({ nullable: true })
  total?: number

  @Field((type) => OderStatus)
  @Column({ type: "enum", enum: OderStatus })
  status: OderStatus
}
