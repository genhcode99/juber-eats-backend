import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "src/users/entities/user.entity"
import { Repository } from "typeorm"
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto"
import { Order } from "./entities/order.entity"

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersDB: Repository<Order>,
  ) {}

  // Create Order
  async createOrder(
    customer: User,
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
    } catch (e) {
      return {
        ok: false,
        error: "Could Not Create Order",
      }
    }
  }
}
