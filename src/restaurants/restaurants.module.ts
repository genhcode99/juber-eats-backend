import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Restaurant } from "./entities/restaurant.entity"
import { RestaurantsResolver } from "./restaurants.resolver"
import { RestaurantService } from "./restaurants.service"

@Module({
  // [TypeOrmModule.forFeature([Restaurant])] -> Repository 를 import 함.
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantsResolver, RestaurantService],
})
export class RestaurantsModule {}
