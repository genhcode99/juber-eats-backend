import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { JwtMiddleware } from "./jwt/jwt.middleware"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())

  // 프론트엔드가 사진업로드를 할수 있도록 허가해줌
  app.enableCors()

  await app.listen(process.env.PORT || 4000)
}
bootstrap()
