import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { User } from "src/users/entities/user.entity"
import { Repository } from "typeorm"
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from "./dtos/create-payment.dto"
import { Payment } from "./entities/payment.entity"

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsDB: Repository<Payment>,

    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,
  ) {}

  // Create Payment
  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      // 1. Restaurant 존재 확인
      const restaurant = await this.restaurantsDB.findOne(restaurantId)
      if (!restaurant) {
        return {
          ok: false,
          error: "Restaurant Not Found",
        }
      }

      // 2. Restaurant 주인확인
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You Are Not Owner Of This Restaurant",
        }
      }

      // 3. Payment 만들기
      await this.paymentsDB.save(
        this.paymentsDB.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      )

      return {
        ok: true,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could Not Create Payment",
      }
    }
  }
}
