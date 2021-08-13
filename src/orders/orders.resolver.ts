import { Role } from "src/auth/role.decorator"
import { Order } from "./entities/order.entity"
import { OrdersService } from "./orders.service"
import { User } from "src/users/entities/user.entity"
import { AuthUser } from "src/auth/auth-user.decorator"
import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from "@nestjs/graphql"
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto"
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto"
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto"
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto"
import { Inject } from "@nestjs/common"
import { PubSub } from "graphql-subscriptions"
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from "src/common/common.constants"
import { OrderUpdatesInput } from "./dtos/order-updates.dto"
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto"

@Resolver((of) => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  // PendingOrders => Subscription
  @Subscription((returns) => Order, {
    filter: (payload, veriables, context) => {
      return payload.pendingOrders.ownerId === context.user.id
    },
    resolve: (payload) => {
      return payload.pendingOrders.order
    },
  })
  @Role(["Owner"])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER)
  }

  //  cookedOrders => Subscription
  @Subscription((retruns) => Order)
  @Role(["Delivery"])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER)
  }

  // cookedOrders => Subscription
  @Subscription((returns) => Order, {
    filter: (
      { orderUpdates }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        orderUpdates.driverId !== user.id &&
        orderUpdates.customerId !== user.id &&
        orderUpdates.restaurant.ownerId !== user.id
      ) {
        return false
      }
      return orderUpdates.id === input.id
    },
  })
  @Role(["Any"])
  orderUpdates(@Args("input") orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE)
  }

  @Mutation((returns) => TakeOrderOutput)
  @Role(["Delivery"])
  takeOrder(
    @AuthUser() driver: User,
    @Args("input") takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, takeOrderInput)
  }
}
