import { Request, Response } from "express";
import { TFAuthenticationController } from "../../../controllers/two-factor-authentication-controller";
import { UserModel } from "../../../models/user/user.schema";
import { checkPassword } from "../../../utils/crypto/crypto";
import { JWTokenManager } from "../../../utils/jwt";
import { TPartialTokenSession } from "../../../utils/jwt/definitions";
export const createUniqueUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, dateOfBirth } = req.body;
  try {
    const user = await UserModel.createUniqueUser({
      email,
      firstName,
      lastName,
      dateOfBirth,
      plainTextPassword: password,
    });
    res.status(200).send({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

export const generateAndSendToken = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({
      "email": email,
    });
    if (user) {
      const passwordResult = await checkPassword({
        hashedPassword: user.hashedPassword,
        plainTextPassword: password,
      });
      if (!passwordResult)
        return res.status(401).send({
          error:
            "Authentication error: please check the email address and password combination.",
        });
      const partialSession: TPartialTokenSession = {
        _id: user._id.toString(),
        email: user.email,
      };
      const session = await JWTokenManager.encodeSession(partialSession);
      user.jwToken = session.token;
      await user.save();
      return res.status(200).send(session);
    } else {
      return res.status(401).send({
        error:
          "Authentication error: Please verify you have entered correct credentials",
      });
    }
  } catch (err) {
    return res.status(401).send({
      error: "Server error: We're unable to create an authentication session",
    });
  }
};

export const processTFAVerification = async (req: Request, res: Response) => {
  const { tfaToken, userId, authCode, isEnrolling } = req.body;

  try {
    const tfaController = new TFAuthenticationController(userId, {
      testMode: true,
    });
    const verifyResponse = await tfaController.validate({
      authCode,
      isEnrolling,
      token: tfaToken,
    });
    if (verifyResponse.status === "error")
      return res.status(400).send(verifyResponse);
    return res.status(200).send({
      verifyResponse,
    });
  } catch (exception: any) {
    return res.status(500).send({
      error: "TFA server error",
    });
  }
};
