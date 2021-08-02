import { Module } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { ConfigService } from "@nestjs/config"
import { UsersService } from "./users.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { UsersResolver } from "./users.resolver"

@Module({
  // Repository import
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
