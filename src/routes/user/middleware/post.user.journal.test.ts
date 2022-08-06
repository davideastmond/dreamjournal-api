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

describe("new user journal post route tests", () => {
  test("POST /api/user/:userId/journals creates a journal for user", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "testemail@example.com",
      firstName: "test_fn",
      lastName: "test_ln",
      plainTextPassword: "testPwd",
      dateOfBirth: new Date().toDateString(),
    });

    const res = await request
      .post(`/api/user/${mockUser._id.toString()}/journals`)
      .send({
        title: "Post test journal",
        description: "some test description",
        tags: ["first", "second", "lastTag"],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.user._id).toBe(mockUser._id.toString());
    expect(res.body.journal.ownerId).toBe(mockUser._id.toString());
  });
});
