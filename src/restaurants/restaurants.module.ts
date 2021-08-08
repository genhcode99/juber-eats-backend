import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Category } from "./entities/cetegory.entity"
import { Restaurant } from "./entities/restaurant.entity"
import { RestaurantsResolver } from "./restaurants.resolver"
import { RestaurantService } from "./restaurants.service"

@Module({
  // [TypeOrmModule.forFeature([Restaurant])] -> Repository 를 import 함.
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    TypeOrmModule.forFeature([Category]),
  ],
  providers: [RestaurantsResolver, RestaurantService],
})
export class RestaurantsModule {}
