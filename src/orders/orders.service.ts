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

      for (const item of items) {
        const dish = await this.dishesDB.findOne(item.dishId)
        if (!dish) {
          return {
            ok: false,
            error: "Dish Not Found",
          }
        }
        console.log(`Dish price: ${dish.price}`)
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          )
          if (dishOption) {
            if (dishOption.extra) {
              console.log(`$USD + ${dishOption.extra}`)
            } else {
              const dishOptionChoice = dishOption.choice.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              )
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  console.log(`$USD + ${dishOptionChoice.extra}`)
                }
              }
            }
          }
        }

        // await this.orderItemsDB.save(
        //   this.orderItemsDB.create({
        //     dish,
        //     options: item.options,
        //   }),
        // )
      }
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
