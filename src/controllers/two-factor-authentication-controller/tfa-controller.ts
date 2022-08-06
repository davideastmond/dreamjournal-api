require("dotenv").config();
const customParseFormat = require("dayjs/plugin/customParseFormat");
import mongoose from "mongoose";
import { UserModel } from "../../models/user/user.schema";
import { IUserDocument } from "../../models/user/user.types";
import { JWTokenManager } from "../../utils/jwt";
import { TDecodeResult } from "../../utils/jwt/definitions";
import { TMessageData } from "../twilio-sms/definitions";
import { createTwilioTextMessage } from "../twilio-sms/twilio-sms-service";
import {
  T2FADeEnrollResponse,
  TAuthCodeResponse,
  TTFAValidationResponse,
} from "./definitions";
import { isPhoneNumberValid } from "./utils";
import dayjs from "dayjs";

dayjs.extend(customParseFormat);

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

    await this.setCTN(user, ctn);
    await this.setCode(user);
    await user.save();
    return this.sendAuthCodeTextMessage(user);
  }

  private async setCTN(user: IUserDocument, ctn: string) {
    user.security.twoFactorAuthentication.userCtn = ctn;
  }

  private async setCode(user: IUserDocument) {
    const authCode = this.generateAuthorizationCode();
    const tokenData = await this.generateToken(user);
    user.security.twoFactorAuthentication.authCode = authCode;
    user.security.twoFactorAuthentication.token = tokenData.token;
    user.security.twoFactorAuthentication.tokenCreatedAt =
      tokenData.tokenIssued;
    user.security.twoFactorAuthentication.tokenExpiresAt =
      tokenData.tokenExpires;
    user.security.twoFactorAuthentication.readableTokenDateData.issued = dayjs
      .unix(tokenData.tokenIssued)
      .format("DD-MMM-YYYY HH:mm:ss");
    user.security.twoFactorAuthentication.readableTokenDateData.expires = dayjs
      .unix(tokenData.tokenExpires)
      .format("DD-MMM-YYYY HH:mm:ss");
  }
  /**
   * deactivates the TFA setting from a user profile
   */
  public async deEnroll(): Promise<T2FADeEnrollResponse> {
    const user = await this.getUser();
    const statusMessage =
      user.security.twoFactorAuthentication.enabled === false
        ? "Warning: two factor authentication is already disabled"
        : "ok";
    user.security.twoFactorAuthentication.enabled = false;
    user.security.twoFactorAuthentication.userCtn = null;
    user.security.twoFactorAuthentication.token = null;
    await user.save();

    return {
      twoFactorEnabled: user.security.twoFactorAuthentication.enabled,
      status: "ok",
      statusMessage,
    };
  }
  /**
   *
   * This does the actual validation when user sends their authCode back
   * We want to make sure everything lines up and the request isn't expired
   */
  public async validate({
    authCode,
    token,
    isEnrolling,
  }: {
    authCode: string;
    token: string;
    isEnrolling: boolean;
  }): Promise<TTFAValidationResponse> {
    const user = await this.getUser();
    const decodedSession = await this.getDecodedTFASessionFromToken(token);

    if (decodedSession.type === "valid") {
      if (user._id.toString() !== decodedSession.session._id) {
        return {
          status: "error",
          isEnrollment: isEnrolling,
          statusMessage: "TFA: userIds do not match",
        };
      }

      if (this.getIsTokenExpired(decodedSession.session.expires))
        return {
          status: "error",
          isEnrollment: isEnrolling,
          statusMessage: "TFA: Authorization token expired",
        };

      if (authCode === user.security?.twoFactorAuthentication?.authCode) {
        const response = {
          status: "ok",
          isEnrollment: isEnrolling,
          statusMessage: "ok",
        };
        if (isEnrolling) {
          user.security.twoFactorAuthentication.enabled = true;
          user.security.twoFactorAuthentication.userCtnVerified = true;
        }
        await user.save();
        return response;
      } else {
        return {
          status: "error",
          isEnrollment: isEnrolling,
          statusMessage: "TFA: Invalid authorization code",
        };
      }
    }
    return {
      status: "error",
      isEnrollment: isEnrolling,
      statusMessage: "TFA: Unable to complete verification operation",
    };
  }

  private async getDecodedTFASessionFromToken(
    token: string
  ): Promise<TDecodeResult> {
    const data = await JWTokenManager.decodeSession(token);
    if (data.type === "valid") {
      return data;
    }
    throw new Error(
      "Getting decoded TFA session from token: returned invalid session."
    );
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

  private async generateToken(user: IUserDocument): Promise<{
    token: string;
    tokenIssued: number;
    tokenExpires: number;
  }> {
    const encodingResult = await JWTokenManager.encodeSession({
      email: user.email,
      _id: user._id.toString(),
    });
    const tokenIssued = Date.now();
    const tokenExpires = tokenIssued + TFA_TOKEN_EXPIRY;
    return { token: encodingResult.token, tokenIssued, tokenExpires };
  }

  private getIsTokenExpired(sessionUnixExpiryTime: number): boolean {
    const currentTimeStamp = Date.now();
    return currentTimeStamp > sessionUnixExpiryTime;
  }
}

export default TFAuthenticationController;
