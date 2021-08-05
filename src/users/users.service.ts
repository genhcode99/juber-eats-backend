import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { LoginInput, LoginOutput } from "./dtos/login.dto"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "src/jwt/jwt.service"
import { InjectRepository } from "@nestjs/typeorm"
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto"
import { Verification } from "./entities/verification.entity"
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto"
import { UserProfileOutput } from "./dtos/user-profile.dto"
import { VerifyEmailOutput } from "./dtos/verify-email.dto"
import { MailService } from "src/mail/mail.service"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationDB: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // Create Account
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exist = await this.userDB.findOne({ email })
      if (exist) {
        return { ok: false, error: "There is a user with that email already" }
      }
      const user = await this.userDB.save(
        this.userDB.create({ email, password, role }),
      )
      const verification = await this.verificationDB.save(
        this.verificationDB.create({ user }),
      )
      this.mailService.sendVerificationEmail(user.email, verification.code)
      return { ok: true, error: null }
    } catch (e) {
      return { ok: false, error: "Couldn't create account." }
    }
  }

  // Login
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userDB.findOne(
        { email },
        { select: ["id", "password"] },
      )
      if (!user) {
        return {
          ok: false,
          error: "User not found",
          token: null,
        }
      }
      const passwordCorrect = await user.checkPassword(password)
      if (!passwordCorrect) {
        return {
          ok: false,
          error: "Wrong password",
          token: null,
        }
      }
      const token = this.jwtService.sign(user.id)
      return {
        ok: true,
        error: null,
        token,
      }
    } catch (e) {
      return {
        ok: false,
        error: "Can't log user in.",
        token: null,
      }
    }
  }

  // Find user
  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.userDB.findOneOrFail({ id })
      return {
        ok: true,
        user,
      }
    } catch (e) {
      return {
        ok: false,
        error: "User Not Found",
      }
    }
  }

  // Edit Profile( 비밀번호 업테이트가 아닐경우에는 userDB.update 방법을 사용하는게 효율적)
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.userDB.findOne(userId)
      if (email) {
        user.email = email
        user.verified = false
        const verification = await this.verificationDB.save(
          this.verificationDB.create({ user }),
        )
        this.mailService.sendVerificationEmail(user.email, verification.code)
      }
      if (password) {
        user.password = password
      }
      await this.userDB.save(user)
      return {
        ok: true,
      }
    } catch (error) {
      return {
        ok: false,
        error: "Could not update profile.",
      }
    }
  }

  // Verify Email
  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verificationDB.findOne(
        { code },
        { relations: ["user"] },
      )
      if (verification) {
        verification.user.verified = true
        this.userDB.save(verification.user)
        return {
          ok: true,
        }
      }
    } catch (error) {
      return {
        ok: false,
        error,
      }
    }
  }
}
