require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { TokenSessionManager } from "../../../controllers/authentication/token-session-manager";
import { TTokenSession } from "../../../utils/jwt/definitions";

export async function jwtVerifyMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.NODE_ENV && process.env.NODE_ENV.match("test")) {
    next();
    return;
  }
  const unauthorized = (message: string) =>
    res.status(401).json({
      error: message,
    });

  const requestHeader = "x-jwt-token";
  const responseHeader = "x-renewed-jwt-token";
  const tokenFromHeader = req.header(requestHeader);

  if (
    !tokenFromHeader ||
    tokenFromHeader === "null" ||
    tokenFromHeader === null
  ) {
    return unauthorized("X-JWT-Token is null or missing");
  }

  try {
    const decodedSession = await TokenSessionManager.decodeSession(
      tokenFromHeader
    );
    if (decodedSession.type !== "valid") {
      return unauthorized("Token is missing or invalid in this request");
    }
    const sessionStatus = TokenSessionManager.checkExpirationStatus(
      decodedSession.session
    );

    if (sessionStatus === "expired") {
      return unauthorized("Session expired");
    }

    let session: TTokenSession;

    if (sessionStatus === "grace") {
      const { token, expires, issued } =
        await TokenSessionManager.encodeSession(decodedSession.session);
      session = {
        ...decodedSession.session,
        expires,
        issued,
      };
      res.setHeader(responseHeader, token);
    } else {
      session = decodedSession.session;
    }
    res.locals = {
      ...res.locals,
      session,
    };

    next();
  } catch (decodedSessionException: any) {
    return unauthorized(decodedSessionException.message);
  }
}
