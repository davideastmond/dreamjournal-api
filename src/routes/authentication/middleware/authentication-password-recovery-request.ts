import { Request, Response } from "express";
import { IMailGunClientSendParams } from "../../../clients/mail-gun-api-client/definitions";
import { MailGunAPIClient } from "../../../clients/mail-gun-api-client/mail-gun-api-client";

import { PasswordRecoveryAuthenticator } from "../../../controllers/authentication/password-recovery-authenticator";
import { RecoveryLinkGenerator } from "../../../controllers/authentication/recovery-link-generator";

const ADMIN_EMAIL = process.env.MAILER_ADMIN_EMAIL ?? "admin@oneiro.live";
export const authenticateRequest = async (req: Request, res: Response) => {
  const { email, dateOfBirth } = req.body;

  const passwordRecoveryAuthenticator: PasswordRecoveryAuthenticator =
    new PasswordRecoveryAuthenticator(email, dateOfBirth);
  const linkGenerator: RecoveryLinkGenerator = new RecoveryLinkGenerator(
    passwordRecoveryAuthenticator
  );
  try {
    const url = await linkGenerator.generate();
    // We need to send this url to the Email client to send this link to user
    const mailerClient: MailGunAPIClient = new MailGunAPIClient();
    const messageData: IMailGunClientSendParams = {
      from: `Admin <${ADMIN_EMAIL}>`,
      to: [email],
      subject: "Oneiro.live password recovery",
      text: "To update your password for oneiro.live, click on the recovery link below",
      html: `<html>
        <p>To reset and change your password, click on the recovery link below:</p>
        <br>
        <a href=${url}>${url}</a>
        <br>
        <p>Yours sincerely,</p> 
        <p><b>Oneiro.live</b> admin team</p>
      </html>`,
    };
    await mailerClient.send(messageData);
    return res.status(200).send({ url });
  } catch (err: any) {
    console.log(err);
    return res.status(401).send({ error: err.message });
  }
};
