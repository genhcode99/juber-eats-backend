import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto"
import { UseGuards } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { UsersService } from "./users.service"
import { AuthGuard } from "src/auth/auth.guard"
import { AuthUser } from "src/auth/auth-user.decorator"
import { LoginInput, LoginOutput } from "./dtos/login.dto"
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql"
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto"
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto"
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto"

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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

  // Me
  @Query((returns) => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser
  }

  // User Profile
  @Query((returns) => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId)
      if (!user) {
        throw Error()
      }
      return {
        ok: true,
        error: null,
        user,
      }
    } catch (error) {
      return {
        ok: false,
        error: "User not found",
        user: null,
      }
    }
  }

  // Edit Profile
  @Mutation((returns) => EditProfileOutput)
  @UseGuards(AuthGuard)
  async editProfile(
    @AuthUser() authUser: User,
    @Args("input") editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.usersService.editProfile(authUser.id, editProfileInput)
      return {
        ok: true,
        error: null,
      }
    } catch (error) {
      return {
        ok: false,
        error,
      }
    }
  }

  @Mutation((returns) => VerifyEmailOutput)
  verifyEmail(@Args("input") { code }: VerifyEmailInput) {
    this.usersService.verifyEmail(code)
    return {
      ok: false,
      error: null,
    }
  }
}
