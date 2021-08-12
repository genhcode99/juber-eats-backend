import { PUB_SUB } from "./common.constants"
import { PubSub } from "graphql-subscriptions"
import { Global, Module } from "@nestjs/common"

@Global()
@Module({
  providers: [{ provide: PUB_SUB, useValue: new PubSub() }],
  exports: [PUB_SUB],
})
export class CommonModule {}
