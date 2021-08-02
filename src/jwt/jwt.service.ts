import { CONFIG_OPTIONS } from "./jwt.constants"
import { JwtModuleOptions } from "./jwt.interfaces"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  hello() {
    console.log("hello")
  }
}
