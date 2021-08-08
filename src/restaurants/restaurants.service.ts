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

  // Create Restaurant
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateAccountOutput> {
    try {
      const newRestaurant = this.restaurantsDB.create(createRestaurantInput)
      newRestaurant.owner = owner

      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase()
      const categorySlug = categoryName.replace(/ /g, "-")
      let category = await this.categoryDB.findOne({ slug: categorySlug })
      if (!category) {
        category = await this.categoryDB.save(
          this.categoryDB.create({ slug: categorySlug, name: categoryName }),
        )
      }

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
  ): Promise<EditProfileOutput> {}
}
