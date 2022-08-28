import { Request, Response } from "express";
import { UserModel } from "../../../models/user/user.schema";

export const getTwoFactorAuthStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findById(userId);
    if (user) {
      return res.status(200).send({
        twoFactorAuthentication: {
          enabled: user.security.twoFactorAuthentication.enabled || false,
        },
      });
    }
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
};
