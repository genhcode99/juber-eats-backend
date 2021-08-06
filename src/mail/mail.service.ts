import got from "got"
import * as FormData from "form-data"
import { Inject, Injectable } from "@nestjs/common"
import { EmailVar, MailModuleOptions } from "./mail.interfaces"
import { CONFIG_OPTIONS } from "src/common/common.constants"

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  // Send Email
  async sendEmail(subject: string, template: string, emailVar: EmailVar[]) {
    const form = new FormData()
    form.append(
      "from",
      `JeWoo from Juber Eats <mailgun@${this.options.domain}>`,
    )
    form.append("to", `twfilm17@gmail.com`)
    form.append("subject", subject)
    form.append("template", template)
    emailVar.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value))

    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString("base64")}`,
        },
        body: form,
      })
    } catch (error) {
      console.log(error)
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail("Verify your Email", "1", [
      { key: "code", value: code },
      { key: "username", value: email },
    ])
  }
}
