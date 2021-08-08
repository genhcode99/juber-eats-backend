import { Repository } from "typeorm"
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
    } catch (e) {}
    return {
      ok: false,
      error: "Could not edit Restaurant",
    }
  }
}
