import { Role } from "src/auth/role.decorator"
import { Order } from "./entities/order.entity"
import { OrdersService } from "./orders.service"
import { User } from "src/users/entities/user.entity"
import { AuthUser } from "src/auth/auth-user.decorator"
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql"
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto"
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto"
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto"
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto"
import { PubSub } from "graphql-subscriptions"

const pubsub = new PubSub()

@Resolver((of) => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  // Create Order
  @Mutation((returns) => CreateOrderOutput)
  @Role(["Client"])
  createOrder(
    @AuthUser() customer: User,
    @Args("input") createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput)
  }

  // Get Order S
  @Query((returns) => GetOrdersOutput)
  @Role(["Any"])
  getOrders(
    @AuthUser() user: User,
    @Args("input") getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput)
  }

  // Get Order
  @Query((returns) => GetOrderOutput)
  @Role(["Any"])
  getOrder(
    @AuthUser() user: User,
    @Args("input") getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput)
  }

  // Edit Order
  @Mutation((type) => EditOrderOutput)
  @Role(["Any"])
  editOrder(
    @AuthUser() user: User,
    @Args("input") editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput)
  }

  @Mutation((returns) => Boolean)
  potatoReady() {
    pubsub.publish("hotPotatos", {
      readyPotatoes: "Your patato ready. Love you",
    })
    return true
  }

  // Subscription
  @Subscription((retruns) => String)
  @Role(["Any"])
  readyPotatoes(@AuthUser() user: User) {
    return pubsub.asyncIterator("hotPotatos")
  }
}
