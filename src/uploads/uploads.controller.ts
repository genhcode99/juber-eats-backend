import { FileInterceptor } from "@nestjs/platform-express"
import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common"

@Controller("uploads")
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file) {
    console.log(file)
  }
}
