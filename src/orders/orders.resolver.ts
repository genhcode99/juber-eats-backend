import { Role } from "src/auth/role.decorator"
import { Order } from "./entities/order.entity"
import { OrdersService } from "./orders.service"
import { User } from "src/users/entities/user.entity"
import { AuthUser } from "src/auth/auth-user.decorator"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto"

@Resolver((of) => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation((returns) => CreateOrderOutput)
  @Role(["Client"])
  createOrder(
    @AuthUser() customer: User,
    @Args("input") createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput)
  }
}
