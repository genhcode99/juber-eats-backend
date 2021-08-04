import { v4 as uuidv4 } from "uuid"
import { User } from "./user.entity"
import { CoreEntity } from "src/common/entities/core.entity"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm"

@InputType()
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string

  @OneToOne((type) => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4()
  }
}
