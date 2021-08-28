import * as Joi from "joi"
import { Module } from "@nestjs/common"
import { JwtModule } from "./jwt/jwt.module"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { MailModule } from "./mail/mail.module"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { UsersModule } from "./users/users.module"
import { User } from "./users/entities/user.entity"
import { OrdersModule } from "./orders/orders.module"
import { CommonModule } from "./common/common.module"
import { Order } from "./orders/entities/order.entity"
import { Dish } from "./restaurants/entities/dish.entity"
import { PaymentsModule } from "./payments/payments.module"
import { Payment } from "./payments/entities/payment.entity"
import { OrderItem } from "./orders/entities/order-item.entity"
import { Category } from "./restaurants/entities/cetegory.entity"
import { Verification } from "./users/entities/verification.entity"
import { RestaurantsModule } from "./restaurants/restaurants.module"
import { Restaurant } from "./restaurants/entities/restaurant.entity"
import { UploadsModule } from "./uploads/uploads.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
      ignoreEnvFile: process.env.NODE_ENV === "prod",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("dev", "prod", "test"),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== "prod",
      logging:
        process.env.NODE_ENV !== "prod" && process.env.NODE_ENV !== "test",
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),

    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      // http 링크에는 req가 있고 websoket에는 connection 이 있다.
      context: ({ req, connection }) => {
        const TOKEN_KEY = "x-jwt"
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        }
      },
    }),

    ScheduleModule.forRoot(),

    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),

    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),

    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
