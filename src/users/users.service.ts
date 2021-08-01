import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { User } from "./entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
  ) {}
}
