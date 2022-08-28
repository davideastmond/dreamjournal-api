require("dotenv").config();
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../../test-helpers/mongo-test.config";
import server from "../../../server";
import { UserModel } from "../../../models/user/user.schema";

import supertest from "supertest";
const options = mongoTestOptions;
let mongoServer: any;

const request = supertest(server);

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

describe("get user security tests", () => {
  describe("two factor auth route tests", () => {
    test("GET api/user/:userId/profile/security/two_factor_status - should return 200 with appropriate response (no 2fa enabled)", async () => {
      const mockUser = await UserModel.createUniqueUser({
        email: "test@email.com",
        firstName: "testFn",
        lastName: "testLn",
        plainTextPassword: "testpwd12345",
        dateOfBirth: new Date().toDateString(),
      });
      const res = await request.get(
        `/api/user/${mockUser._id}/profile/security/tfa/status`
      );
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("twoFactorAuthentication");
      expect(res.body.twoFactorAuthentication).toHaveProperty("enabled");
      expect(res.body.twoFactorAuthentication.enabled).toBe(false);
    });
  });
});
