require("dotenv").config();
import dayjs from "dayjs";
import { v4 as uuidV4 } from "uuid";
import { IS_PRODUCTION } from "../../check-environment-variables";
import { IUserDocument } from "../../models/user/user.types";
import { JWTokenManager } from "../../utils/jwt";
import { PasswordRecoveryAuthenticator } from "./password-recovery-authenticator";

const BASE_DOMAIN = IS_PRODUCTION
  ? process.env.PRODUCTION_BASE_DOMAIN
  : process.env.DEV_BASE_DOMAIN;

const EXPIRY_INTERVAL = process.env.RECOVERY_TOKEN_EXPIRE_INTERVAL || 10;

export class RecoveryLinkGenerator {
  private authenticator: PasswordRecoveryAuthenticator;
  constructor(authenticator: PasswordRecoveryAuthenticator) {
    this.authenticator = authenticator;
  }

  /**
   * Generate recovery url to be sent to user via e-mail
   * @returns string
   */
  public async generate(): Promise<string> {
    const user = await this.authenticator.validate();
    if (user) {
      // Get a basic UUID
      const token = this.generateToken();
      // Patch the security fields on this user with raw uuid token
      const tokenizedUserDocument = await this.tokenize(user, token);

      // This will return a JWT encrypted token in the URL. It will contain
      // The email and the UUID token
      const url = await this.generateURL(tokenizedUserDocument);
      return url;
    } else {
      throw new Error("Unable to authenticate this user");
    }
  }

  private generateToken(): string {
    return uuidV4();
  }

  private async tokenize(user: IUserDocument, token: string) {
    const updatePackage: any = {
      createdAt: dayjs().toDate(),
      expiresAt: dayjs()
        .add(parseInt(EXPIRY_INTERVAL as string), "minutes")
        .toDate(),
      acceptanceToken: null,
      token: token,
    };
    user.security.passwordRecovery = updatePackage;
    return user.save();
  }

  private async generateURL(user: IUserDocument): Promise<string> {
    // The base domain changes depending on production / dev environment
    const token = user.security.passwordRecovery.token;
    // We should encrypt the token using JWT and the user's email together as part of url
    const encryptedToken = await JWTokenManager.encode({
      token: token,
      email: user.email,
    });
    return `${BASE_DOMAIN}?token=${encryptedToken}`;
  }
}
