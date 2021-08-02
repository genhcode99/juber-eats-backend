import * as jwt from "jsonwebtoken"
import { CONFIG_OPTIONS } from "./jwt.constants"
import { JwtModuleOptions } from "./jwt.interfaces"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey)
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey)
  }
}
