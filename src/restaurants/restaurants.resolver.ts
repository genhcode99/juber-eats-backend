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
  AllRestaurantsInput,
  AllRestaurantsOutput,
} from "./dtos/allRestaurants.dto"
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
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from "./dtos/create-restaurant.dto"
import { CreateAccountOutput } from "src/users/dtos/create-account.dto"
import { CategoryInput, CategoryOutput } from "./dtos/category.dto"
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto"
import {
  SearchRestaurantsInput,
  SearchRestaurantsOutput,
} from "./dtos/search-restaurants.dto"
import { Dish } from "./entities/dish.entity"
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto"
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto"
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto"
import { MyRestaurantsOutput } from "./dtos/my-restaurants.dto"
import { MyRestaurantInput, MyRestaurantOutput } from "./dtos/my-restaurant.dto"

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // Create Restaurant
  @Mutation((returns) => CreateRestaurantOutput)
  @Role(["Owner"])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args("input") createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
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

  // All Restaurants
  @Query((returns) => AllRestaurantsOutput)
  allRestaurants(
    @Args("input") allRestaurantsInput: AllRestaurantsInput,
  ): Promise<AllRestaurantsOutput> {
    return this.restaurantService.allRestaurants(allRestaurantsInput)
  }

  // Restaurant
  @Query((returns) => RestaurantOutput)
  restaurant(
    @Args("input") restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput)
  }

  // My Restaurant
  @Query((retruns) => MyRestaurantOutput)
  @Role(["Owner"])
  myRestaurant(
    @AuthUser() owner: User,
    @Args("input") myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restaurantService.myRestaurant(owner, myRestaurantInput)
  }

  // Search Restaurant
  @Query((returns) => SearchRestaurantsOutput)
  searchRestaurant(
    @Args("input") searchRestaurantsInput: SearchRestaurantsInput,
  ): Promise<SearchRestaurantsOutput> {
    return this.restaurantService.SearchRestaurantByName(searchRestaurantsInput)
  }

  // My Restaurants
  @Query((returns) => MyRestaurantsOutput)
  @Role(["Owner"])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(owner)
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

@Resolver((of) => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // Create Dish
  @Mutation((type) => CreateDishOutput)
  @Role(["Owner"])
  createDish(
    @AuthUser() owner: User,
    @Args("input") createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput)
  }

  // Edit Dish
  @Mutation((type) => EditDishOutput)
  @Role(["Owner"])
  editDish(
    @AuthUser() owner: User,
    @Args("input") editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput)
  }

  // Delete Dish
  @Mutation((type) => DeleteDishOutput)
  @Role(["Owner"])
  deleteDish(
    @AuthUser() owner: User,
    @Args("input") deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput)
  }
}
