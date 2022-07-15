require("dotenv").config();
import mongoose from "mongoose";
import { UserModel } from "../../models/user/user.schema";
import { IUserDocument } from "../../models/user/user.types";
import { JWTokenManager } from "../../utils/jwt";
import { TMessageData } from "../twilio-sms/definitions";
import { createTwilioTextMessage } from "../twilio-sms/twilio-sms-service";
import { TAuthCodeResponse } from "./definitions";
import { isPhoneNumberValid } from "./utils";
const TFA_MAX = 999999;
const TFA_MIN = 111111;
const TFA_AUTH_MESSAGE_TEMPLATE = "Your one-time Oneiro authorization code is";
const TFA_TOKEN_EXPIRY = parseInt(process.env.TFA_TOKEN_EXPIRY_INTERVAL);

class TFAuthenticationController {
  private readonly userId: string;
  private readonly testMode: boolean = false;
  constructor(userId: string, options?: { testMode: boolean }) {
    this.testMode = options && options.testMode === true;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      this.userId = userId;
    } else {
      throw new Error(`Invalid userId: ${userId}`);
    }
  }

  public getUserId(): string {
    return this.userId;
  }

  /**
   * This guy accesses the user document,updates 2fa and sends Twilio Message
   */
  public async enroll(ctn: string): Promise<TAuthCodeResponse> {
    if (!isPhoneNumberValid(ctn))
      throw new Error(`${ctn} does not appear to be a valid phone number`);
    const user = await this.getUser();
    const authCode = this.generateAuthorizationCode();
    const token = await this.generateToken(user);
    const tokenIssued = Date.now();
    const tokenExpires = tokenIssued + TFA_TOKEN_EXPIRY;

    user.security.twoFactorAuthentication.userCtn = ctn;
    user.security.twoFactorAuthentication.authCode = authCode;
    user.security.twoFactorAuthentication.token = token;
    user.security.twoFactorAuthentication.tokenCreatedAt = tokenIssued;
    user.security.twoFactorAuthentication.tokenExpiresAt = tokenExpires;

    await user.save();
    return this.sendAuthCodeTextMessage(user);
  }

  private async sendAuthCodeTextMessage(
    user: IUserDocument
  ): Promise<TAuthCodeResponse> {
    const authCodeMessage: TMessageData = {
      to: user.security.twoFactorAuthentication.userCtn,
      body: `${TFA_AUTH_MESSAGE_TEMPLATE}: ${user.security.twoFactorAuthentication.authCode}`,
    };
    // In test environment, don't do the Twilio text message but still return response
    if (this.testMode && process.env.NODE_ENV.match("test"))
      return {
        authCode: user.security.twoFactorAuthentication.authCode,
        token: user.security.twoFactorAuthentication.token,
      };
    if (this.testMode) {
      return {
        authCode: user.security.twoFactorAuthentication.authCode,
        token: user.security.twoFactorAuthentication.token,
      };
    }

    try {
      await createTwilioTextMessage(authCodeMessage);
      return {
        authCode: user.security.twoFactorAuthentication.authCode,
        token: user.security.twoFactorAuthentication.token,
      };
    } catch (exception: any) {
      throw new Error(exception.message);
    }
  }

  private async getUser(): Promise<IUserDocument> {
    return UserModel.findById(this.userId);
  }

  private generateAuthorizationCode(): string {
    const min = Math.ceil(TFA_MIN);
    const max = Math.floor(TFA_MAX);
    const value = Math.floor(Math.random() * (max - min + 1) + min);
    return value.toString();
  }

  private async generateToken(user: IUserDocument): Promise<string> {
    const encodingResult = await JWTokenManager.encodeSession({
      email: user.email,
      _id: user._id.toString(),
    });
    return encodingResult.token;
  }
}

export default TFAuthenticationController;
