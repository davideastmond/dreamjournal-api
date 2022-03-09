require("dotenv").config();

const jwt = require("jsonwebtoken");
import { IS_PRODUCTION } from "../../check-environment-variables";
import {
  TDecodeResult,
  TEncodeResult,
  TExpirationStatus,
  TPartialTokenSession,
  TTokenSession,
} from "./definitions";

const TOKEN_EXPIRE = parseInt(process.env.JWT_TOKEN_EXPIRE);
const TOKEN_GRACE_PERIOD = parseInt(process.env.JWT_TOKEN_GRACE_PERIOD);
export class JWTokenManager {
  private static readonly JWT_SECRET: string = IS_PRODUCTION
    ? process.env.PRODUCTION_JSON_SECRET
    : process.env.DEV_JSON_SECRET;
  private static readonly tokenAlgorithm: string = "HS256";
  public static async encodeSession(
    partialSession: TPartialTokenSession
  ): Promise<TEncodeResult> {
    return new Promise((resolve, reject) => {
      const issued = Date.now();
      const expires = issued + TOKEN_EXPIRE;
      const session: TTokenSession = {
        ...partialSession,
        issued,
        expires,
      };

      jwt.sign(
        session,
        JWTokenManager.JWT_SECRET,
        { algorithm: JWTokenManager.tokenAlgorithm },
        (err: any, token: string) => {
          if (err) {
            reject(new Error(err));
          }
          resolve({
            token,
            issued,
            expires,
          });
        }
      );
    });
  }

  public static async decodeSession(token: string): Promise<TDecodeResult> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        JWTokenManager.JWT_SECRET,
        { algorithm: JWTokenManager.tokenAlgorithm },
        (err: any, tokenizedObject: TTokenSession) => {
          if (err) {
            console.log(err.message);
            reject({ type: "invalid", message: err.message });
          }
          resolve({
            type: "valid",
            session: tokenizedObject,
          });
        }
      );
    });
  }

  public static checkExpirationStatus(
    session: TTokenSession
  ): TExpirationStatus {
    const now = Date.now();
    if (session.expires > now) {
      return "active";
    }

    const gracePeriod = session.expires + TOKEN_GRACE_PERIOD;
    if (gracePeriod > now) {
      return "grace";
    }
    return "expired";
  }
}
