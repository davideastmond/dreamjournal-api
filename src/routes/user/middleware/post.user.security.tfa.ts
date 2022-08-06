import { Request, Response } from "express";
import { TFAuthenticationController } from "../../../controllers/two-factor-authentication-controller";

export async function enrollTwoFactorAuthentication(
  req: Request,
  res: Response
) {
  const { userId } = req.params;
  const { ctn } = req.body;

  try {
    const tfa = new TFAuthenticationController(userId, { testMode: true });
    const enrollResponse = await tfa.enroll(ctn);
    return res.status(200).send({
      token: enrollResponse.token,
    });
  } catch (exception: any) {
    return res.status(500).send({
      error: exception.message,
    });
  }
}
