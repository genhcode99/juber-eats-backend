import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Dish } from "src/restaurants/entities/dish.entity"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { User, UserRole } from "src/users/entities/user.entity"
import { Repository } from "typeorm"
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto"
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto"
import { OrderItem } from "./entities/order-item.entity"
import { Order } from "./entities/order.entity"

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersDB: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemsDB: Repository<OrderItem>,

    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,

    @InjectRepository(Dish)
    private readonly dishesDB: Repository<Dish>,
  ) {}

  // Create Order
  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      // 1. 레스토랑 찾기.
      const restaurant = await this.restaurantsDB.findOne(restaurantId)
      if (!restaurant) {
        return {
          ok: false,
          error: "Restaurant Not Found",
        }
      }

      let orderFinalPrice = 0
      const orderItems: OrderItem[] = []
      for (const item of items) {
        const dish = await this.dishesDB.findOne(item.dishId)
        if (!dish) {
          return {
            ok: false,
            error: "Dish Not Found",
          }
        }
        let dishFinalPrice = dish.price

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          )
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra
            } else {
              const dishOptionChoice = dishOption.choice.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              )
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice

        const orderitem = await this.orderItemsDB.save(
          this.orderItemsDB.create({
            dish,
            options: item.options,
          }),
        )
        orderItems.push(orderitem)
      }

      const order = await this.ordersDB.save(
        this.ordersDB.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      )
      return {
        ok: true,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could Not Create Order",
      }
    }
  }

  // GetOrders
  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[]
      if (user.role === UserRole.Client) {
        orders = await this.ordersDB.find({ where: { customer: user } })
      } else if (user.role === UserRole.Delivery) {
        orders = await this.ordersDB.find({ where: { driver: user } })
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurantsDB.find({
          where: { owner: user },
          relations: ["orders"],
        })
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1)
      }
      return {
        ok: true,
        orders,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could Not get Orders",
      }
    }
  }
}
