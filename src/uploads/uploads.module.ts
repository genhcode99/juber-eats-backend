import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { UploadsController } from "./uploads.controller"

@Module({
  imports: [ConfigService],
  controllers: [UploadsController],
})
export class UploadsModule {}
