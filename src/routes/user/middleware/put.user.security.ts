import { Request, Response } from "express";
import { UserModel } from "../../../models/user/user.schema";

export const putUserSecurityQuestionsOnUserDocument = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);

    if (user) {
      await user.insertSecurityQuestionsForUser(req.body);
      return res.status(201).send({ status: "security questions updated" });
    } else {
      return res
        .status(404)
        .send({ error: `user with id ${userId} not found` });
    }
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
};
