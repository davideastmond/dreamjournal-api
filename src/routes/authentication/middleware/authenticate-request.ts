import { Request, Response, NextFunction } from "express";
import { IRecoveryCodeData } from "../../../controllers/authentication/definitions";
import { UserModel } from "../../../models/user/user.schema";
import { JWTokenManager } from "../../../utils/jwt";
import { v4 as uuidV4 } from "uuid";
import dayjs from "dayjs";
import { hashPassword } from "../../../utils/crypto/crypto";
import { IUserDocument } from "../../../models/user/user.types";
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

export async function decodePasswordRecoveryEncryptedToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { encryptedToken } = req.body;
  try {
    const decodedUserData = await JWTokenManager.decode<{
      token: string;
      email: string;
    }>(encryptedToken);
    if (decodedUserData && decodedUserData.email && decodedUserData.token) {
      res.locals = {
        ...res.locals,
        decodedUserData,
      };
      return next();
    }
    return returnError({
      res,
      stringCode: "98dhj32",
      errorMessage: "Recover request is not valid",
      httpErrorCode: 400,
    });
  } catch (err: any) {
    return returnError({
      res,
      stringCode: "17YdsmKef",
      errorMessage: `Invalid token: ${err.message}`,
      httpErrorCode: 400,
    });
  }
}

export async function findUserByDecodedToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      decodedUserData,
    }: { decodedUserData: { email: string; token: string } } =
      res.locals as any;
    const user = await UserModel.findOne({ email: decodedUserData.email });
    if (user) {
      res.locals = {
        ...res.locals,
        user,
      };
      return next();
    }
    return returnError({
      res,
      stringCode: "38dhd120",
      errorMessage: `User not found with email: ${decodedUserData.email}`,
      httpErrorCode: 404,
    });
  } catch (err: any) {
    return returnError({
      res,
      stringCode: "2YxCLkYu7",
      errorMessage: `Request: ${err.message}`,
      httpErrorCode: 500,
    });
  }
}

export async function checkTokenExpired(req: Request, res: Response) {
  const { user }: { user: IUserDocument } = res.locals as any;
  const { acceptanceToken, plainTextPassword } = req.body;
  try {
    if (!isTokenExpired(user.security.passwordRecovery.expiresAt)) {
      // Check the acceptance token
      if (acceptanceToken === user.security.passwordRecovery.acceptanceToken) {
        // Let's update the password here
        const hashedPassword = await hashPassword({
          password: plainTextPassword,
        });
        user.hashedPassword = hashedPassword;
        await user.save();
        return res.status(200).send({
          message: "password has been changed",
        });
        // TODO: maybe we want to send a notification e-mail to user that their personal data is changed?
      }
      return returnError({
        res,
        stringCode: "90nvDh8H",
        errorMessage: "Invalid acceptance token",
        httpErrorCode: 400,
      });
    }
    return returnError({
      res,
      stringCode: "7IKlg3E",
      errorMessage: "Token is expired, dude",
      httpErrorCode: 498,
    });
  } catch (err: any) {
    return returnError({
      res,
      stringCode: "2NxCLBYu1",
      errorMessage: `Request: ${err.message}`,
      httpErrorCode: 500,
    });
  }
}

function isTokenExpired(expiryDate: Date): boolean {
  const expDate = dayjs(expiryDate);
  const now = dayjs();
  return now.isAfter(expDate);
}

function returnError({
  res,
  stringCode,
  httpErrorCode,
  errorMessage,
}: {
  res: Response;
  stringCode: string;
  httpErrorCode: number | string;
  errorMessage: string;
}) {
  return res.status(httpErrorCode as number).send({
    errors: [
      {
        value: `${stringCode}`,
        msg: `${stringCode} ${errorMessage}`,
        param: "passwordRecovery",
        location: "n/a",
      },
    ],
  });
}
