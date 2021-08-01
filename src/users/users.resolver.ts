import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto"
import { User } from "./entities/user.entity"
import { UsersService } from "./users.service"
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql"

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true
  }

  @Mutation(() => CreateAccountOutput)
  createAccount(@Args("input") createAccountInput: CreateAccountInput) {}
}
