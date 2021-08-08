import { Role } from "src/auth/role.decorator"
import { AuthUser } from "src/auth/auth-user.decorator"
import { Restaurant } from "./entities/restaurant.entity"
import { RestaurantService } from "./restaurants.service"
import { User, UserRole } from "src/users/entities/user.entity"
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql"
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto"
import { CreateAccountOutput } from "src/users/dtos/create-account.dto"
import { EditProfileOutput } from "src/users/dtos/edit-profile.dto"
import { EditRestaurantInput } from "./dtos/edit-restaurant.dto"
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from "./dtos/delete-restaurant.dto"

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // Create Restaurant
  @Mutation((returns) => CreateAccountOutput)
  @Role(["Owner"])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args("input") createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateAccountOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    )
  }

  // Edit Restaurant
  @Mutation((returns) => EditProfileOutput)
  @Role(["Owner"])
  editRestaurant(
    @AuthUser() owner: User,
    @Args("input") editRestaurantInput: EditRestaurantInput,
  ): Promise<EditProfileOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput)
  }

  // Delete Restaurant
  @Mutation((returns) => DeleteRestaurantOutput)
  @Role(["Owner"])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args("input") deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput)
  }
}
