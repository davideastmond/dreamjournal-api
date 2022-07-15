require("dotenv").config();
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../../test-helpers/mongo-test.config";
import server from "../../../server";
import supertest from "supertest";
import { UserModel } from "../../../models/user/user.schema";

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

describe("patch user tests", () => {
  describe("Update user name & password tests", () => {
    test("should update the user's password", async () => {
      const mockUser = await UserModel.createUniqueUser({
        email: "em@example.com",
        firstName: "fn",
        lastName: "ln",
        plainTextPassword: "testOriginalPassword",
      });
      const res = await request
        .patch(`/api/user/${mockUser._id.toString()}/profile/secure`)
        .send({
          password: "testNewPassword",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBeDefined();
      expect(res.body.status).toBe("Password updated OK");
    });
    test("updates first and last names for user", async () => {
      const mockUser = await UserModel.createUniqueUser({
        email: "em@example.com",
        firstName: "fn",
        lastName: "ln",
        plainTextPassword: "testOriginalPassword",
      });
      const res = await request
        .patch(`/api/user/${mockUser._id.toString()}/profile/basic`)
        .send({
          firstName: "newFirstName",
          lastName: "newLastName",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.firstName).toBe("newFirstName");
      expect(res.body.lastName).toBe("newLastName");
    });
  });
});
