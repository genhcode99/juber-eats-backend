import { Field, ObjectType } from "@nestjs/graphql"
import { IsBoolean, IsOptional, IsString, Length } from "class-validator"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

//typedefs 와 스키마 migration 에 있는 내용이 여기로 들어왔다고 생각하라.

@ObjectType()
@Entity()
export class Restaurant {
  @Field((type) => Number)
  @PrimaryGeneratedColumn()
  id: number

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string

  @Field((type) => Boolean, { defaultValue: true })
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isVegan: boolean

  @Field((type) => String)
  @Column()
  @IsString()
  address: string
}
