import { Module } from "@nestjs/common"
import { Order } from "./entities/order.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { OrdersService } from "./orders.service"
import { OrdersResolver } from "./orders.resolver"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant])],
  providers: [OrdersResolver, OrdersService],
})
export class OrdersModule {}
