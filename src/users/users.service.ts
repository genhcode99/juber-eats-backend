import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { LoginInput } from "./dtos/login.dto"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "src/jwt/jwt.service"
import { InjectRepository } from "@nestjs/typeorm"
import { CreateAccountInput } from "./dtos/create-account.dto"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // Create Account
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const exist = await this.userDB.findOne({ email })
      if (exist) {
        return { ok: false, error: "There is a user with that email already" }
      }
      await this.userDB.save(this.userDB.create({ email, password, role }))
      return { ok: false, error: null }
    } catch (e) {
      return { ok: false, error: "Couldn't create account." }
    }
  }

  // Login
  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.userDB.findOne({ email })
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
    } catch (error) {
      return {
        ok: false,
        error,
        token: null,
      }
    }
  }
}
