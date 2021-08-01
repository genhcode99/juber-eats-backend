import { User } from "./entities/user.entity"
import { UsersService } from "./users.service"
import { Query, Resolver } from "@nestjs/graphql"

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true
  }
}
