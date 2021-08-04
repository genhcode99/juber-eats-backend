import { Module } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { ConfigService } from "@nestjs/config"
import { UsersService } from "./users.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { UsersResolver } from "./users.resolver"
import { Verification } from "./entities/verification.entity"

@Module({
  // Repository import
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
