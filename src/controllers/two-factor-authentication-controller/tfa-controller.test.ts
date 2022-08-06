require("dotenv").config();
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../test-helpers/mongo-test.config";
import { UserModel } from "../../models/user/user.schema";
import TFAuthenticationController from "./tfa-controller";
import * as TwilioMessageService from "../twilio-sms/twilio-sms-service";
const options = mongoTestOptions;
let mongoServer: any;

const mockCTN = process.env.TEST_RECIPIENT;
beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  try {
    await mongoose.connect(mongoUri, options);
  } catch (exception) {
    console.warn("Mongo error", exception);
  }
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
describe("two factor auth controller tests", () => {
  describe("enrollment phase of 2fa", () => {
    test("it updates the user document with appropriate enrollment settings", async () => {
      const mockUser = await UserModel.createUniqueUser({
        email: "test@example.com",
        firstName: "fn",
        lastName: "ln",
        plainTextPassword: "testPassword1234",
        dateOfBirth: new Date().toDateString(),
      });

      const tfController = new TFAuthenticationController(
        mockUser._id.toString(),
        { testMode: true }
      );
      const enrollmentData = await tfController.enroll(mockCTN);

      // expect the user.security.twoFactor objects to be set
      const refreshedMockUser = await UserModel.findById(
        mockUser._id.toString()
      );
      const { twoFactorAuthentication } = refreshedMockUser.security;
      expect(twoFactorAuthentication.enabled).toBe(false);
      expect(twoFactorAuthentication.userCtn).toBe(mockCTN);
      expect(twoFactorAuthentication.userCtnVerified).toBe(false);
      expect(twoFactorAuthentication.token).toBeDefined();
      expect(twoFactorAuthentication.token.length > 10).toBe(true);

      const tokenExpiryInterval = parseInt(
        process.env.TFA_TOKEN_EXPIRY_INTERVAL
      );
      expect(
        twoFactorAuthentication.tokenExpiresAt -
          twoFactorAuthentication.tokenCreatedAt
      ).toBe(tokenExpiryInterval);

      console.log(enrollmentData);
    });
    test("enroll method should throw an error if ctn is invalid", async () => {
      const mockUser = await UserModel.createUniqueUser({
        email: "test@example.com",
        firstName: "fn",
        lastName: "ln",
        plainTextPassword: "testPassword1234",
        dateOfBirth: new Date().toDateString(),
      });

      const mockInvalidCTN = "+5897";
      const tfController = new TFAuthenticationController(
        mockUser._id.toString(),
        { testMode: true }
      );
      await expect(() => tfController.enroll(mockInvalidCTN)).rejects.toThrow();
    });
  });
});

describe("TFA test mode", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  test("Twilio SMS service is not called when in test mode", async () => {
    const spy = jest.spyOn(TwilioMessageService, "createTwilioTextMessage");
    const mockUser = await UserModel.createUniqueUser({
      email: "test@example.com",
      firstName: "fn",
      lastName: "ln",
      plainTextPassword: "testPassword1234",
      dateOfBirth: new Date().toDateString(),
    });
    const mockInvalidCTN = "+1415557750";
    const tfController = new TFAuthenticationController(
      mockUser._id.toString(),
      { testMode: true }
    );
    await tfController.enroll(mockInvalidCTN);
    expect(spy).not.toHaveBeenCalled();
  });
});
