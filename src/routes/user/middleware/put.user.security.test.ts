require("dotenv").config();
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../../test-helpers/mongo-test.config";
import server from "../../../server";
import supertest from "supertest";
import { UserModel } from "../../../models/user/user.schema";
import { TUserSecurityQuestionsPutRequestData } from "../../../models/user";

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

describe("user security questions tests", () => {
  test("put route works and returns correct response", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "test@test.com",
      firstName: "TestFn",
      lastName: "testLn",
      plainTextPassword: "plaintextpassword",
      dateOfBirth: new Date().toDateString(),
    });

    const securityQuestion: TUserSecurityQuestionsPutRequestData = {
      q0: {
        selectedQuestionId: "A0",
        selectedQuestionPrompt: "00-q",
        id: "A0",
        response: "response0",
      },
      q1: {
        selectedQuestionId: "A1",
        selectedQuestionPrompt: "01-q",
        id: "A1",
        response: "response1",
      },
      q2: {
        selectedQuestionId: "A2",
        selectedQuestionPrompt: "02-q",
        id: "A2",
        response: "response2",
      },
    };
    const res = await request
      .put(`/api/user/${mockUser._id.toString()}/profile/security`)
      .send(securityQuestion);
    expect(res.body.status).toBeDefined();
    expect(res.body.status).toBe("security questions updated");
    expect(res.statusCode).toBe(201);
  });
});
