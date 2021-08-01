import { Field } from "@nestjs/graphql"
import {
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number

  @CreateDateColumn()
  @Field((type) => Date)
  createdAt: Date

  @UpdateDateColumn()
  @Field((type) => Date)
  updatedAt: Date
}
