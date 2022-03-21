import { Request, Response, NextFunction } from "express";
import { convertToSecureUser } from "../../../controllers/user/utils";
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
    console.log("30", exception);
    return res.status(500).send({ error: exception.message });
  }
}

export async function checkIfSessionUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.params;
  if (!userId)
    return res.status(400).send({ error: "param userId is missing" });
  if (userId !== "me") next();

  const id = res.locals.session._id;
  try {
    const user = await UserModel.findById(id);
    if (user) {
      const secureUser = convertToSecureUser(user);
      res.status(200).send(secureUser);
    } else next();
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
}
