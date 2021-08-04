import got from "got"
import * as FormData from "form-data"
import { Inject, Injectable } from "@nestjs/common"
import { MailModuleOptions } from "./mail.interfaces"
import { CONFIG_OPTIONS } from "src/common/common.constants"

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail("test", "test")
  }

  // Send Email
  private async sendEmail(subject: string, content: string) {
    const form = new FormData()
    form.append("from", `Excited User <mailgun@${this.options.domain}>`)
    form.append("to", `twfilm17@gmail.com`)
    form.append("subject", subject)
    form.append("template", "1")
    form.append("v:username", "nico")
    form.append("v:code", "lalala")

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString("base64")}`,
        },
        body: form,
      },
    )
    console.log(response.body)
  }
}