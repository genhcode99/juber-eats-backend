import { Module } from "@nestjs/common"
import { Order } from "./entities/order.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { OrdersService } from "./orders.service"
import { OrdersResolver } from "./orders.resolver"

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrdersResolver, OrdersService],
})
export class OrdersModule {}
