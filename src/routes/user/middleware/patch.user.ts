import { Request, Response } from "express";
import { TFAuthenticationController } from "../../../controllers/two-factor-authentication-controller";
import { convertToSecureUser } from "../../../controllers/user/utils";
import { UserModel } from "../../../models/user/user.schema";
import { checkPassword } from "../../../utils/crypto/crypto";

export const updatePasswordMiddleware = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findById(userId);
    if (user) {
      await user.updateUserPassword(req.body.password);
      return res.status(200).send({ status: "Password updated OK" });
    } else {
      return res
        .status(404)
        .send({ error: `User with id ${userId} not found` });
    }
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
};

export const patchPersonalInfo = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { firstName, lastName, dateOfBirth } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      const updatedUserData = await user.updateFirstNameLastNameDob({
        firstName,
        lastName,
        dateOfBirth,
      });
      const sanitizedData = convertToSecureUser(updatedUserData);
      res.status(201).send(sanitizedData);
    } else {
      return res
        .status(404)
        .send({ error: `User with id ${userId} not found` });
    }
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
};

export const cancelTwoFactorAuthentication = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  const { plainTextPassword } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).send({
        error: `User with ${userId} not found`,
      });

    if (
      await checkPassword({
        hashedPassword: user.hashedPassword,
        plainTextPassword: plainTextPassword,
      })
    ) {
      // passwords match, perform operation
      const tfaController = new TFAuthenticationController(userId);
      const deEnrollResult = await tfaController.deEnroll();
      return res.status(200).send(deEnrollResult);
    } else {
      return res.status(401).send({
        error: "[401] Unable to verify the password",
      });
    }
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
};
