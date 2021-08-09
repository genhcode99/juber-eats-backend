import { Repository, Like } from "typeorm"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "src/users/entities/user.entity"
import { Category } from "./entities/cetegory.entity"
import { Restaurant } from "./entities/restaurant.entity"
import { EditRestaurantInput } from "./dtos/edit-restaurant.dto"
import { EditProfileOutput } from "src/users/dtos/edit-profile.dto"
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto"
import { CategoryRepository } from "./repositories/category.repository"
import { CreateAccountOutput } from "src/users/dtos/create-account.dto"
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from "./dtos/delete-restaurant.dto"
import { AllCategoriesOutput } from "./dtos/all-categories.dto"
import { CategoryInput, CategoryOutput } from "./dtos/category.dto"
import {
  AllRestaurantsInput,
  AllRestaurantsOutput,
} from "./dtos/allRestaurants.dto"
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto"
import {
  SearchRestaurantsInput,
  SearchRestaurantsOutput,
} from "./dtos/search-restaurants.dto"

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,

    private readonly categoryDB: CategoryRepository,
  ) {}

  // Create Restaurant
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateAccountOutput> {
    try {
      const newRestaurant = this.restaurantsDB.create(createRestaurantInput)
      newRestaurant.owner = owner

      const category = await this.categoryDB.getOrCreate(
        createRestaurantInput.categoryName,
      )

      newRestaurant.category = category
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

  // Edit Restaurant
  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditProfileOutput> {
    try {
      // 1. 레스토랑이 존재하는지 확인
      const restaurants = await this.restaurantsDB.findOneOrFail(
        editRestaurantInput.restaurantId,
      )
      if (!restaurants) {
        return {
          ok: false,
          error: "Restaurant not found",
        }
      }

      // 2.레스토랑의 주인이 맞는지 확인
      if (owner.id !== restaurants.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        }
      }

      // 3.카테고리 변경을 요청한 경우
      let category: Category = null
      if (editRestaurantInput.categoryName) {
        category = await this.categoryDB.getOrCreate(
          editRestaurantInput.categoryName,
        )
      }

      // 4. 레스토랑 정보를 저장
      await this.restaurantsDB.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ])

      return {
        ok: true,
      }
    } catch (e) {}
    return {
      ok: false,
      error: "Could not edit Restaurant",
    }
  }

  // Delete Restaurant
  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      // 1. 레스토랑이 존재하는지 확인
      const restaurants = await this.restaurantsDB.findOneOrFail(restaurantId)
      if (!restaurants) {
        return {
          ok: false,
          error: "Restaurant not found",
        }
      }

      // 2.레스토랑의 주인이 맞는지 확인
      if (owner.id !== restaurants.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        }
      }

      // 3. 레스토랑 삭제
      await this.restaurantsDB.delete(restaurantId)

      return {
        ok: true,
      }
    } catch (e) {}
    return {
      ok: false,
      error: "Could not delete Restaurant",
    }
  }

  // All Category
  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categoryDB.find()
      return {
        ok: true,
        categories,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not load categories",
      }
    }
  }

  // Count Restaurant
  countRestaurant(category: Category) {
    return this.restaurantsDB.count({ category })
  }

  // Find Category by Category with pagination
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoryDB.findOne({ slug })
      if (!category) {
        return {
          ok: false,
          error: "Category not found",
        }
      }

      const restaurants = await this.restaurantsDB.find({
        where: { category },
        take: 5,
        skip: (page - 1) * 5,
      })

      const totalRestaurant = await this.countRestaurant(category)

      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalRestaurant / 5),
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not load category",
      }
    }
  }

  // All restaurants
  async allRestaurants({
    page,
  }: AllRestaurantsInput): Promise<AllRestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurantsDB.findAndCount(
        {
          take: 5,
          skip: (page - 1) * 5,
        },
      )

      return {
        ok: true,
        results: restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 5),
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not load restaurants",
      }
    }
  }

  // Restaurant
  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurantsDB.findOneOrFail(restaurantId)
      if (!restaurant) {
        return {
          ok: false,
          error: "Restaurant not found",
        }
      }
      return {
        ok: true,
        restaurant,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not find restaurant",
      }
    }
  }

  // Search Restaurant
  async SearchRestaurantByName({
    query,
    page,
  }: SearchRestaurantsInput): Promise<SearchRestaurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurantsDB.findAndCount({
        where: { name: Like(`%${query}%`) },
      })
    } catch (e) {
      return {
        ok: false,
        error: "",
      }
    }
  }
}
