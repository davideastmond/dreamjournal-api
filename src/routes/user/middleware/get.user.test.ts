require("dotenv").config();
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../../test-helpers/mongo-test.config";
import server from "../../../server";
import { UserModel } from "../../../models/user/user.schema";

import supertest from "supertest";
import { JournalModel } from "../../../models/journal/journal.schema";
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

describe("get.user tests", () => {
  test("GET api/user/:userId/secureProfile", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "testemail@example.com",
      firstName: "test_fn",
      lastName: "test_ln",
      plainTextPassword: "testPwd",
      dateOfBirth: new Date().toDateString(),
    });
    const res = await request.get(`/api/user/${mockUser._id.toString()}`);
    expect(res.body.email).toBe("testemail@example.com");
    expect(res.body._id).toBe(mockUser._id.toString());
    expect(res.body.hashedPassword).not.toBeDefined();
  });

  test("GET api/user/:userId/journals - returns all journals for a user", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "testemail@example.com",
      firstName: "test_fn",
      lastName: "test_ln",
      plainTextPassword: "testPwd",
      dateOfBirth: new Date().toDateString(),
    });
    await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      title: "testTitle00",
      tags: ["apple", "peach", "plumb"],
    });
    await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      title: "testTitle01",
      tags: ["partisan", "peach", "soap"],
    });
    await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      title: "testTitle02",
      tags: ["apple", "kincaid", "plumb"],
    });
    const res = await request.get(
      `/api/user/${mockUser._id.toString()}/journals`
    );
    expect(res.body).toHaveProperty("length");
    expect(res.body.length).toBe(3);
    const res2 = await request.get(
      `/api/user/${mockUser._id.toString()}/journals/tags/analytics`
    );
    expect(res2.body.tagCount).toBeDefined();
    expect(res2.body.journalCount).toBeDefined();
    expect(res2.body.journalCount).toBe(3);
    expect(res2.body.tagCount).toEqual({
      apple: 2,
      peach: 2,
      plumb: 2,
      partisan: 1,
      soap: 1,
      kincaid: 1,
    });
  });
});
