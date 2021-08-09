import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql"
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from "./dtos/delete-restaurant.dto"
import { Role } from "src/auth/role.decorator"
import { User } from "src/users/entities/user.entity"
import { Category } from "./entities/cetegory.entity"
import { AuthUser } from "src/auth/auth-user.decorator"
import { Restaurant } from "./entities/restaurant.entity"
import { RestaurantService } from "./restaurants.service"
import { AllCategoriesOutput } from "./dtos/all-categories.dto"
import { EditRestaurantInput } from "./dtos/edit-restaurant.dto"
import { EditProfileOutput } from "src/users/dtos/edit-profile.dto"
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto"
import { CreateAccountOutput } from "src/users/dtos/create-account.dto"
import { CategoryInput, CategoryOutput } from "./dtos/category.dto"

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

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField((type) => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurant(category)
  }

  @Query((type) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories()
  }

  @Query((type) => CategoryOutput)
  findCategoryBySlug(
    @Args("input") categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput)
  }
}
