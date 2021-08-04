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
  createAccount(
    @Args("input") createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput)
  }

  // Login
  @Mutation((returns) => LoginOutput)
  login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput)
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
  userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId)
  }

  // Edit Profile
  @Mutation((returns) => EditProfileOutput)
  @UseGuards(AuthGuard)
  editProfile(
    @AuthUser() authUser: User,
    @Args("input") editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput)
  }

  // Verify Email
  @Mutation((returns) => VerifyEmailOutput)
  verifyEmail(
    @Args("input") { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code)
  }
}
