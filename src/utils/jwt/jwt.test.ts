import { UserModel } from "../../models/user/user.schema";
import { TPartialTokenSession, TTokenSession } from "./definitions";
import { JWTokenManager } from "./jwt";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { mongoTestOptions } from "../../test-helpers/mongo-test.config";

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
    });

    const partialSession: TPartialTokenSession = {
      id: testUser._id.toString(),
      createdAt: Date.now(),
      email: testUser.email,
    };
    const encodingResult = await JWTokenManager.encodeSession(partialSession);

    console.log(encodingResult);
    expect(encodingResult).toBeDefined();
    expect(typeof encodingResult.token).toBe("string");
  });
  test("gets proper session object", async () => {
    const testUser = await UserModel.createUniqueUser({
      firstName: "testFirst",
      lastName: "testLast",
      plainTextPassword: "password",
      email: "email@example.com",
    });

    const partialSession: TPartialTokenSession = {
      id: testUser._id.toString(),
      createdAt: Date.now(),
      email: testUser.email,
    };
    const encodingResult = await JWTokenManager.encodeSession(partialSession);
    const result = (await JWTokenManager.decodeSession(
      encodingResult.token
    )) as { type: "valid"; session: TTokenSession };

    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("session");
    expect(result.session).toHaveProperty("email");
    expect(result.session.email).toBe("email@example.com");
    expect(result.session).toHaveProperty("createdAt");
    expect(result.session).toHaveProperty("issued");
    expect(result.session).toHaveProperty("expires");
  });
  test("expect error when token is invalid", async () => {
    const badToken = "soknlasdf";
    await expect(() =>
      JWTokenManager.decodeSession(badToken)
    ).rejects.toThrow();
  });
});
