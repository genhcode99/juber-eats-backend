import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Restaurant } from "./entities/restaurant.entity"
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto"
import { CreateAccountOutput } from "src/users/dtos/create-account.dto"
import { User } from "src/users/entities/user.entity"

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,
  ) {}

  // Create Restaurant
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateAccountOutput> {
    try {
      const newRestaurant = this.restaurantsDB.create(CreateRestaurantInput)
      await this.restaurantsDB.save(newRestaurant)
      return {
        ok: true,
        error: null,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not create restaurant",
      }
    }
  }
}
