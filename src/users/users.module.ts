import { Module } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { UsersService } from "./users.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersResolver } from "./users.resolver"
import { ConfigService } from "@nestjs/config"

@Module({
  // Repository import
  imports: [TypeOrmModule.forFeature([User]), ConfigService],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
