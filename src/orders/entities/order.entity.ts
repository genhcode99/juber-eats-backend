import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql"
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from "typeorm"
import { User } from "src/users/entities/user.entity"
import { CoreEntity } from "src/common/entities/core.entity"
import { Dish } from "src/restaurants/entities/dish.entity"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { OrderItem } from "./order-item.entity"
import { IsEnum, IsNumber } from "class-validator"

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
  // Customer
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: "SET NULL",
  })
  customer?: User

  @RelationId((order: Order) => order.customer)
  customerId: number

  // Driver
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.rides, {
    onDelete: "SET NULL",
  })
  driver?: User

  @RelationId((order: Order) => order.driver)
  driverId: number

  // Restaurant
  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: "SET NULL",
  })
  restaurant?: Restaurant

  // Items
  // Many to Many 에서 JoinTable 은 owning side에 한번만 사용한다.
  @Field((type) => [OrderItem])
  @ManyToMany((type) => OrderItem)
  @JoinTable()
  items: OrderItem[]

  @Field((type) => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number

  @Field((type) => OderStatus)
  @Column({ type: "enum", enum: OderStatus, default: OderStatus.Pending })
  @IsEnum(OderStatus)
  status: OderStatus
}
