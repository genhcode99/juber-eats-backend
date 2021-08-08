import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "src/users/entities/user.entity"
import { Category } from "./entities/cetegory.entity"
import { Restaurant } from "./entities/restaurant.entity"
import { EditRestaurantInput } from "./dtos/edit-restaurant.dto"
import { EditProfileOutput } from "src/users/dtos/edit-profile.dto"
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto"
import { CreateAccountOutput } from "src/users/dtos/create-account.dto"

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsDB: Repository<Restaurant>,

    @InjectRepository(Category)
    private readonly categoryDB: Repository<Category>,
  ) {}

  // Get or Create : Category
  async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase()
    const categorySlug = categoryName.replace(/ /g, "-")
    let category = await this.categoryDB.findOne({ slug: categorySlug })
    if (!category) {
      category = await this.categoryDB.save(
        this.categoryDB.create({ slug: categorySlug, name: categoryName }),
      )
    }
    return category
  }

  // Create Restaurant
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateAccountOutput> {
    try {
      const newRestaurant = this.restaurantsDB.create(createRestaurantInput)
      newRestaurant.owner = owner

      const category = await this.getOrCreateCategory(
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
      const restaurants = await this.restaurantsDB.findOneOrFail(
        editRestaurantInput.restaurantId,
      )

      if (!restaurants) {
        return {
          ok: false,
          error: "Restaurant not found",
        }
      }

      if (owner.id !== restaurants.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        }
      }
    } catch (e) {}
    return {
      ok: false,
      error: "Could not edit Restaurant",
    }
  }
}
