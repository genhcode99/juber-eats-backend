import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto"
import { User } from "./entities/user.entity"
import { UsersService } from "./users.service"
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql"
import { LoginInput, LoginOutput } from "./dtos/login.dto"

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => Boolean)
  hi() {
    return true
  }

  // Create Account
  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args("input") createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      return this.usersService.createAccount(createAccountInput)
    } catch (error) {
      return {
        ok: false,
        error,
      }
    }
  }

  // Login
  @Mutation((returns) => LoginOutput)
  async login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.usersService.login(loginInput)
    } catch (error) {
      return {
        ok: false,
        error,
        token: null,
      }
    }
  }

  @Query((returns) => User)
  me(@Context() context) {
    if (!context.user) {
      return
    } else {
      return context.user
    }
  }
}
