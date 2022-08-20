import { Request, Response, NextFunction } from "express";
import { convertToSecureUser } from "../../../controllers/user/utils";
import { UserModel } from "../../../models/user/user.schema";
import { TSecureUser } from "../../../models/user/user.types";
export async function getSecureUserProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const userSession = res.locals.session?._id;
  if (!userSession && !process.env.NODE_ENV.match("test"))
    return res.status(401).send({ error: "Unauthorized session" });
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      if (
        user._id.toString() === userSession ||
        (process.env.NODE_ENV && process.env.NODE_ENV.match("test"))
      ) {
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

export async function checkIfSessionUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.params;
  if (!userId)
    return res.status(400).send({ error: "param userId is missing" });
  if (userId !== "me") {
    next();
    return;
  }

  if (!process.env.NODE_ENV?.match("test")) {
    const id = res.locals.session._id;
    const user = await getSecureUserById(id);
    if (user) return res.status(200).send(user);
    return res.status(404).send({ error: `User with id ${id} not found` });
  } else {
    // Test environment
    const user = await getSecureUserById(userId);
    if (user) return res.status(200).send(user);
    return res.status(404).send({ error: `User with id ${userId} not found` });
  }
}

async function getSecureUserById(id: string): Promise<TSecureUser | null> {
  try {
    const user = await UserModel.findById(id);
    if (user) {
      const secureUser = convertToSecureUser(user);
      return secureUser;
    } else return null;
  } catch (exception: any) {
    return null;
  }
}
