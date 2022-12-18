import {
  TDecodeResult,
  TEncodeResult,
  TExpirationStatus,
  TPartialTokenSession,
  TTokenSession,
} from "../../utils/jwt/definitions";
import { JWTokenManager } from "../../utils/jwt/jwt-token-manager";
const TOKEN_EXPIRE = parseInt(process.env.JWT_TOKEN_EXPIRE);
const TOKEN_GRACE_PERIOD = parseInt(process.env.JWT_TOKEN_GRACE_PERIOD);
/**
 * This class manages the token related stuff pertaining to the authentication session
 */
export class TokenSessionManager {
  public static async encodeSession(
    partialSession: TPartialTokenSession
  ): Promise<TEncodeResult> {
    const issued = Date.now();
    const expires = issued + TOKEN_EXPIRE;
    const session: TTokenSession = {
      ...partialSession,
      issued,
      expires,
    };
    try {
      const sessionToken = await JWTokenManager.encode(session);
      return {
        token: sessionToken,
        issued,
        expires,
      };
    } catch (err: any) {
      throw new Error(err);
    }
  }

  public static async decodeSession(token: string): Promise<TDecodeResult> {
    try {
      const sessionObject: TTokenSession = await JWTokenManager.decode(token);
      return {
        session: sessionObject,
        type: "valid",
      };
    } catch (err: any) {
      throw new Error(err);
    }
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
