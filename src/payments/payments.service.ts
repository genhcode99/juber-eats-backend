import { Injectable } from "@nestjs/common"
import { Cron, Interval, SchedulerRegistry, Timeout } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { User } from "src/users/entities/user.entity"
import { LessThan, Repository } from "typeorm"
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from "./dtos/create-payment.dto"
import { GetPaymentsOutput } from "./dtos/get-payments.dto"
import { Payment } from "./entities/payment.entity"

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsDB: Repository<Payment>,

    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,

    private schedulerRegistry: SchedulerRegistry,
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

      // 4. restaurant Promoted
      restaurant.isPromoted = true
      const date = new Date()
      date.setDate(date.getDate() + 7)
      restaurant.promotedUntil = date
      this.restaurantsDB.save(restaurant)

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

  // Get Payments
  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.paymentsDB.find({ user: user })
      return {
        ok: true,
        payments,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could Not load Payments",
      }
    }
  }

  // 유료회원 만료
  @Interval(10000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurantsDB.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    })
    console.log(restaurants)
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false
      restaurant.promotedUntil = null
      await this.restaurantsDB.save(restaurant)
    })
  }
}
