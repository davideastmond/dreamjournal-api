require("dotenv").config();
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../../test-helpers/mongo-test.config";
import server from "../../../server";
import { UserModel } from "../../../models/user/user.schema";

import supertest from "supertest";
import { JournalModel } from "../../../models/journal/journal.schema";
import { IJournalDocument } from "../../../models/journal/journal.types";
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

describe("get user journals tests", () => {
  test("gets user journals properly and returns correct response", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "test@example.com",
      firstName: "testFn",
      lastName: "testLn",
      plainTextPassword: "someTextPassword",
      dateOfBirth: new Date().toDateString(),
    });

    await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      title: "tRubbleTitle0",
    });
    await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      title: "rNancyTitle1",
    });
    await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      title: "bJournalTitle2",
    });
    const res = await request.get(
      `/api/user/${mockUser._id.toString()}/journals`
    );
    expect(res.body.length).toBe(3);
    expect(res.statusCode).toBe(200);
    const journals = res.body as IJournalDocument[];
    expect(
      journals.every(
        (journalElement) => journalElement.ownerId === mockUser._id.toString()
      )
    );
  });
});
