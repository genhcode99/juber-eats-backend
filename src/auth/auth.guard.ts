import { Reflector } from "@nestjs/core"
import { GqlExecutionContext } from "@nestjs/graphql"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { AllowedRoles } from "./role.decorator"
import { User } from "src/users/entities/user.entity"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    // 메타데이터에서 role 가져오기
    const roles = this.reflector.get<AllowedRoles>(
      "roles",
      context.getHandler(),
    )
    if (!roles) {
      return true
    }

    const gqlContext = GqlExecutionContext.create(context).getContext()
    console.log(gqlContext.token)
    const user: User = gqlContext["user"]
    if (!user) {
      return false
    }

    if (roles.includes("Any")) {
      return true
    }
    return roles.includes(user.role)
  }
}
