import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Restaurant } from "./entities/restaurant.entity"
import { RestaurantService } from "./restaurants.service"
import { CategoryRepository } from "./repositories/category.repository"
import { CategoryResolver, RestaurantsResolver } from "./restaurants.resolver"

@Module({
  // [TypeOrmModule.forFeature([Restaurant])] -> Repository 를 import 함.
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantsResolver, CategoryResolver, RestaurantService],
})
export class RestaurantsModule {}
