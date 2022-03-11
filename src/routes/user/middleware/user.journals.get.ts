import { Request, Response } from "express";
import { UserModel } from "../../../models/user/user.schema";
export async function getJournalsForUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);

    if (user) {
      const journals = await user.getAllJournals();
      return res.status(200).send(journals);
    } else {
      return res.status(404).send({ error: "session user not found " });
    }
  } catch (exception) {
    return res.status(500).send({ error: exception.message });
  }
}
