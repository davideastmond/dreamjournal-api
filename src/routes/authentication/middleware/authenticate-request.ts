import { Request, Response, NextFunction } from "express";
import { IRecoveryCodeData } from "../../../controllers/authentication/definitions";
import { UserModel } from "../../../models/user/user.schema";
import { JWTokenManager } from "../../../utils/jwt";
import { v4 as uuidV4 } from "uuid";
import dayjs from "dayjs";
/**
 * This is going to get an encryptedToken, decrypt it
 * get a user from DB and make sure the email and UUID match.
 * If it does, do a next function
 * @param req
 * @param res
 */
export const authenticatePasswordRecoveryRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { encryptedToken } = req.body;

  try {
    // Decrypt the token. We should get an email and a UUID
    const decryptedData: IRecoveryCodeData = await JWTokenManager.decode(
      encryptedToken
    );
    const users = await UserModel.find({
      email: decryptedData.email,
      "security.passwordRecovery.token": decryptedData.token,
    });
    if (users.length === 0)
      return res.status(404).send({ error: "user resource not found" });
    const [user] = users;

    // Check expiry date
    const { expiresAt } = user.security.passwordRecovery;
    if (isTokenExpired(expiresAt)) throw new Error("Token expired");

    /* Create a UUID and save it to the user document, then send it with an OK response object
     to client
     */
    const acceptanceToken = uuidV4();
    user.security.passwordRecovery.acceptanceToken = acceptanceToken;
    await user.save();
    return res.status(201).send({
      status: "OK",
      acceptanceToken, // This will be saved in session storage on the client
    });
  } catch (err: any) {
    return res.status(400).send({ error: err.message });
  }
};

function isTokenExpired(expiryDate: Date): boolean {
  const expDate = dayjs(expiryDate);
  const now = dayjs();
  return now.isAfter(expDate);
}
