import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { CreateAccountInput } from "./dtos/create-account.dto"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
  ) {}

  // Create Account
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    try {
      const exist = await this.userDB.findOne({ email })
      if (exist) {
        return "There is a user with that email already"
      }
      await this.userDB.save(this.userDB.create({ email, password, role }))
    } catch (e) {
      return "Couldn't create account."
    }
  }
}
