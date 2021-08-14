import { Injectable } from "@nestjs/common"
import { Cron, Interval, SchedulerRegistry, Timeout } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { User } from "src/users/entities/user.entity"
import { Repository } from "typeorm"
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

  @Cron("30 * * * * *", { name: "myjob" })
  async checkForPayments() {
    console.log("Checking for payment(Cron)")
    const job = this.schedulerRegistry.getCronJob("myjob")
    console.log(job)
  }

  @Interval(5000)
  async checkForPaymentsI() {
    console.log("Checking for payment(interval)")
  }

  @Timeout("checkForPaymentsI", 500)
  afterStarts() {
    console.log("congrats")
  }
}
