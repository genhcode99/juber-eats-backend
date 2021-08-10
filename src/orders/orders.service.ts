import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { User } from "src/users/entities/user.entity"
import { Repository } from "typeorm"
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto"
import { Order } from "./entities/order.entity"

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersDB: Repository<Order>,

    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,
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
    } catch (e) {
      return {
        ok: false,
        error: "Could Not Create Order",
      }
    }
  }
}
