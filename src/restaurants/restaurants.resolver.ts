import { User } from "src/users/entities/user.entity"
import { AuthUser } from "src/auth/auth-user.decorator"
import { Restaurant } from "./entities/restaurant.entity"
import { RestaurantService } from "./restaurants.service"
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql"
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto"
import { CreateAccountOutput } from "src/users/dtos/create-account.dto"

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // Create Restaurant
  @Mutation((returns) => CreateAccountOutput)
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args("input") createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateAccountOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    )
  }
}
