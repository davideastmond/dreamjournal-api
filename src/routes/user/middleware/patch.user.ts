import { Request, Response } from "express";
import { convertToSecureUser } from "../../../controllers/user/utils";
import { UserModel } from "../../../models/user/user.schema";

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

export const updateFirstNameLastName = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { firstName, lastName } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      const updatedUserData = await user.updateFirstNameLastName({
        firstName,
        lastName,
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
