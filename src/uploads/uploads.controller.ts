import {
  Controller,
  Injectable,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import * as AWS from "aws-sdk"
import { ConfigService } from "@nestjs/config"
import { FileInterceptor } from "@nestjs/platform-express"

const BUCKET_NAME = "juber-eats-s3-upload"

@Injectable()
@Controller("uploads")
export class UploadsController {
  constructor(private readonly config: ConfigService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      region: "ap-northeast-2",
      credentials: {
        accessKeyId: this.config.get("S3_ACCESS_KEY"),
        secretAccessKey: this.config.get("S3_SECRET_ACCESS_KEY"),
      },
    })
    try {
      const objectName = `${Date.now() + file.originalname}`
      const { Location: url } = await new AWS.S3()
        .upload({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: "public-read",
        })
        .promise()
      return { url }
    } catch (e) {
      return null
    }
  }
}
