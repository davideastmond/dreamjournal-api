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
      });
      const res = await request.get(
        `/api/user/${mockUser._id}/profile/security/two_factor_status`
      );
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("twoFactorAuthentication");
      expect(res.body.twoFactorAuthentication).toHaveProperty("enabled");
      expect(res.body.twoFactorAuthentication.enabled).toBe(false);
    });
  });
  describe("security questions tests", () => {
    test("user isn't found, return a 404 response", async () => {
      const mockMongoObjectID = new mongoose.Types.ObjectId();
      const res = await request.get(
        `/api/user/${mockMongoObjectID.toString()}/security`
      );
      expect(res.statusCode).toBe(404);
    });
    test("get security questions - return appropriate status no questions set", async () => {
      const mockUser = await UserModel.createUniqueUser({
        email: "test@email.com",
        firstName: "testFn",
        lastName: "testLn",
        plainTextPassword: "testpwd12345",
      });
      const res = await request.get(
        `/api/user/${mockUser._id.toString()}/security`
      );
      expect(res.body).toEqual({ isSet: false, recoveryQuestions: [] });
    });
  });
});
