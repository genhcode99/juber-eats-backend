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

  async createAccount({ email, password, role }: CreateAccountInput) {
    try {
      const exist = await this.userDB.findOne({ email })
      if (exist) {
        // make error
        return
      }
      await this.userDB.save(this.userDB.create({ email, password, role }))
      return {
        ok: true,
      }
    } catch (e) {
      //make error
      return
    }

    // 계정 만들기 비밀번호 hash
    // ok, null
  }
}
