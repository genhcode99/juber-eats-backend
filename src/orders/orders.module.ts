import { Module } from "@nestjs/common"
import { Order } from "./entities/order.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { OrdersService } from "./orders.service"
import { OrdersResolver } from "./orders.resolver"
import { OrderItem } from "./entities/order-item.entity"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { Dish } from "src/restaurants/entities/dish.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
  providers: [OrdersResolver, OrdersService],
})
export class OrdersModule {}
