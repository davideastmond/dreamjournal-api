require("dotenv").config();
import { UserModel } from "../../models/user/user.schema";
import { TPartialTokenSession, TTokenSession } from "./definitions";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { mongoTestOptions } from "../../test-helpers/mongo-test.config";
import { TokenSessionManager } from "../../controllers/authentication/token-session-manager";

const options = mongoTestOptions;
let mongoServer: any;

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
describe("JWToken class tests", () => {
  test("properly returns a token", async () => {
    const testUser = await UserModel.createUniqueUser({
      firstName: "testFirst",
      lastName: "testLast",
      plainTextPassword: "password",
      email: "email@example.com",
      dateOfBirth: new Date().toDateString(),
    });

    const partialSession: TPartialTokenSession = {
      _id: testUser._id.toString(),
      email: testUser.email,
    };
    const encodingResult = await TokenSessionManager.encodeSession(
      partialSession
    );
    expect(encodingResult).toBeDefined();
    expect(typeof encodingResult.token).toBe("string");
  });
  test("gets proper session object", async () => {
    const testUser = await UserModel.createUniqueUser({
      firstName: "testFirst",
      lastName: "testLast",
      plainTextPassword: "password",
      email: "email@example.com",
      dateOfBirth: new Date().toDateString(),
    });

    const partialSession: TPartialTokenSession = {
      _id: testUser._id.toString(),
      email: testUser.email,
    };
    const encodingResult = await TokenSessionManager.encodeSession(
      partialSession
    );
    const result = (await TokenSessionManager.decodeSession(
      encodingResult.token
    )) as { type: "valid"; session: TTokenSession };

    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("session");
    expect(result.session).toHaveProperty("email");
    expect(result.session.email).toBe("email@example.com");
    expect(result.session).toHaveProperty("issued");
    expect(result.session).toHaveProperty("expires");
  });
  test("expect error when token is invalid", async () => {
    const badToken = "soknlasdf";
    const alternateToken = process.env.INVALID_TEST_TOKEN;
    await expect(() =>
      TokenSessionManager.decodeSession(badToken)
    ).rejects.toThrow();

    await expect(() =>
      TokenSessionManager.decodeSession(alternateToken)
    ).rejects.toThrow();
  });
  describe("check expiration status tests", () => {
    test("return active status", async () => {
      const mockSession: TTokenSession = {
        _id: "test",
        email: "test",
        issued: Date.now(),
        expires: Date.now() + parseInt(process.env.JWT_TOKEN_EXPIRE),
      };

      const expirationStatus =
        TokenSessionManager.checkExpirationStatus(mockSession);
      expect(expirationStatus).toBe("active");
    });
    test("returns grace status", async () => {
      const mockSession: TTokenSession = {
        _id: "test",
        email: "test",
        issued: Date.now(),
        expires: Date.now() - parseInt(process.env.JWT_TOKEN_EXPIRE),
      };
      const expirationStatus =
        TokenSessionManager.checkExpirationStatus(mockSession);
      expect(expirationStatus).toBe("grace");
    });
    test("returns expired status", async () => {
      const mockSession: TTokenSession = {
        _id: "test",
        email: "test",
        issued: Date.now(),
        expires: Date.now() - 4 * 60 * 60 * 1000,
      };
      const expirationStatus =
        TokenSessionManager.checkExpirationStatus(mockSession);
      expect(expirationStatus).toBe("expired");
    });
  });
});
