import { Repository, ILike } from "typeorm"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "src/users/entities/user.entity"
import { Category } from "./entities/cetegory.entity"
import { Restaurant } from "./entities/restaurant.entity"
import { EditRestaurantInput } from "./dtos/edit-restaurant.dto"
import { EditProfileOutput } from "src/users/dtos/edit-profile.dto"
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from "./dtos/create-restaurant.dto"
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
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto"
import { Dish } from "./entities/dish.entity"
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto"
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto"
import { MyRestaurantsOutput } from "./dtos/my-restaurants.dto"
import { MyRestaurantInput, MyRestaurantOutput } from "./dtos/my-restaurant.dto"

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,

    @InjectRepository(Dish)
    private readonly dishDB: Repository<Dish>,

    private readonly categoryDB: CategoryRepository,
  ) {}

  // Create Restaurant
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
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
        restaurantId: newRestaurant.id,
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
      // 1. ??????????????? ??????????????? ??????
      const restaurants = await this.restaurantsDB.findOneOrFail(
        editRestaurantInput.restaurantId,
      )
      if (!restaurants) {
        return {
          ok: false,
          error: "Restaurant not found",
        }
      }

      // 2.??????????????? ????????? ????????? ??????
      if (owner.id !== restaurants.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        }
      }

      // 3.???????????? ????????? ????????? ??????
      let category: Category = null
      if (editRestaurantInput.categoryName) {
        category = await this.categoryDB.getOrCreate(
          editRestaurantInput.categoryName,
        )
      }

      // 4. ???????????? ????????? ??????
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
      // 1. ??????????????? ??????????????? ??????
      const restaurants = await this.restaurantsDB.findOneOrFail(restaurantId)
      if (!restaurants) {
        return {
          ok: false,
          error: "Restaurant not found",
        }
      }

      // 2.??????????????? ????????? ????????? ??????
      if (owner.id !== restaurants.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        }
      }

      // 3. ???????????? ??????
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
        take: 3,
        skip: (page - 1) * 3,
        order: {
          isPromoted: "DESC",
          createdAt: "ASC",
        },
      })

      const totalRestaurant = await this.countRestaurant(category)

      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalRestaurant / 3),
        totalResults: totalRestaurant,
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
          take: 3,
          skip: (page - 1) * 3,
          order: {
            isPromoted: "DESC",
            createdAt: "ASC",
          },
          relations: ["category"],
        },
      )

      return {
        ok: true,
        results: restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 3),
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not load restaurants",
      }
    }
  }

  // My Restaurant
  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurantsDB.findOne(
        { owner, id },
        { relations: ["menu", "orders"] },
      )
      return {
        restaurant,
        ok: true,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not find restaurant",
      }
    }
  }

  // Restaurant
  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurantsDB.findOneOrFail(restaurantId, {
        relations: ["menu", "category"],
      })
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
  // My Restaurants
  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurantsDB.find({ owner })
      return {
        ok: true,
        restaurants,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not find restaurants.",
      }
    }
  }

  // Search Restaurant
  async SearchRestaurantByName({
    query,
    page,
  }: SearchRestaurantsInput): Promise<SearchRestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurantsDB.findAndCount(
        {
          where: { name: ILike(`%${query}%`) },
          take: 5,
          skip: (page - 1) * 5,
        },
      )
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / 5),
        totalResults,
      }
    } catch (e) {
      return {
        ok: false,
        error: "",
      }
    }
  }

  // Create Dish
  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      // 1. ???????????? ??????
      const restaurant = await this.restaurantsDB.findOne(
        createDishInput.restaurantId,
      )
      if (!restaurant) {
        return {
          ok: false,
          error: "Restaurant Not Found",
        }
      }

      // 2. ???????????? ????????? ??????????????? ???????????? ??????.
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You are not restaurant owner",
        }
      }

      // 3. Dish ??????
      await this.dishDB.save(
        this.dishDB.create({ ...createDishInput, restaurant }),
      )

      return {
        ok: true,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could not create Dish",
      }
    }
  }

  // Edit Dish
  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      // 1. Dish ??? ????????????
      const dish = await this.dishDB.findOne(editDishInput.dishId, {
        relations: ["restaurant"],
      })
      if (!dish) {
        return {
          ok: false,
          error: "Dish Not Found",
        }
      }

      // 2. Dish ???????????? ??????
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You Are Not Restaurant Owner",
        }
      }

      // 3. Dish Update
      await this.dishDB.save([{ id: editDishInput.dishId, ...editDishInput }])
      return {
        ok: true,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could Not Delete Dish",
      }
    }
  }

  // Delete Dish
  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      // 1. Dish ??? ????????????
      const dish = await this.dishDB.findOne(dishId, {
        relations: ["restaurant"],
      })
      if (!dish) {
        return {
          ok: false,
          error: "Dish Not Found",
        }
      }

      // 2. Dish ???????????? ??????
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You Are Not Restaurant Owner",
        }
      }

      // 3. Dish ??????
      await this.dishDB.delete(dishId)
      return {
        ok: true,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Could Not Delete Dish",
      }
    }
  }
}
