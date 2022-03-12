import { Request, Response } from "express";
import { UserModel } from "../../../models/user/user.schema";
export async function getSecureUserProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const userSession = res.locals.session._id;
  if (!userSession)
    return res.status(401).send({ error: "Unauthorized session" });
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      if (user._id.toString() === userSession) {
        return res.status(200).send({
          _id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          journalIds: user.journalIds,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      } else {
        return res
          .status(401)
          .send({ error: "Unauthorized session: userId, sessionId mismatch" });
      }
    } else {
      return res.status(404).send({ error: "Cannot find user" });
    }
  } catch (exception) {
    return res.status(500).send({ error: exception.message });
  }
}
