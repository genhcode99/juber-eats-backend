import { Field } from "@nestjs/graphql"
import {
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date
}
