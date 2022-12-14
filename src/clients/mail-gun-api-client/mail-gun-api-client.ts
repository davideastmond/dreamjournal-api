const MailGun = require("mailgun.js");
const formData = require("form-data");

import { IS_PRODUCTION } from "../../check-environment-variables";
import { IMailGunClientSendParams } from "./definitions";

const API_KEY = IS_PRODUCTION
  ? process.env.MG_PRODUCTION_API_KEY
  : process.env.MG_DEV_API_KEY;
const DOMAIN = IS_PRODUCTION
  ? process.env.MG_PRODUCTION_DOMAIN
  : process.env.MG_DEV_DOMAIN;
export class MailGunAPIClient {
  private mailGunClient: any;

  constructor() {
    const mailgun = new MailGun(formData);
    this.mailGunClient = mailgun.client({ username: "api", key: API_KEY });
  }

  public async send(
    data: IMailGunClientSendParams,
    test?: boolean
  ): Promise<void> {
    if (test) return;
    const result = await this.mailGunClient.messages.create(DOMAIN, data);
    console.info("16 - send result", result);
  }
}
