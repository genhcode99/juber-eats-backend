import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Dish } from "src/restaurants/entities/dish.entity"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { User } from "src/users/entities/user.entity"
import { Repository } from "typeorm"
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto"
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

      items.forEach(async (item) => {
        const dish = await this.dishesDB.findOne(item.dishId)
        if (!dish) {
          // abort this whole thing.
        }
        await this.orderItemsDB.save(
          this.orderItemsDB.create({
            dish,
            options: item.options,
          }),
        )
      })
      // const order = await this.ordersDB.save(
      //   this.ordersDB.create({
      //     customer,
      //     restaurant,
      //   }),
      // )
    } catch (e) {
      return {
        ok: false,
        error: "Could Not Create Order",
      }
    }
  }
}
