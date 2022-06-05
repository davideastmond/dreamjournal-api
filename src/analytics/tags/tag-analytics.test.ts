import { JournalModel } from "../../models/journal/journal.schema";
import { UserModel } from "../../models/user/user.schema";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { mongoTestOptions } from "../../test-helpers/mongo-test.config";
import { IJournalEntry } from "../../models/journalEntry/journal-entry.types";
import { countTags } from "./tag-analytics";

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

describe("tag analytics tests", () => {
  test("tags are being retrieved properly and stored in an array of strings", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "hi@email.com",
      firstName: "f",
      lastName: "ln",
      plainTextPassword: "pwd1234565",
    });

    const testJournals = [
      {
        ownerId: mockUser._id.toString(),
        description: "test-unique-id",
        tags: ["abc", "tag2"],
        title: "E pluribus unum",
      },
    ];

    const insertedJournals = await Promise.all(
      testJournals.map((j) => JournalModel.createJournalForUserId(j))
    );
    const journalEntries = [
      {
        ownerId: mockUser._id.toString(),
        parentJournalId: insertedJournals[0].journal._id.toString(),
        title: "super california",
        text: "some desc",
        tags: ["arg", "nature walk park"],
      },
      {
        ownerId: mockUser._id.toString(),
        parentJournalId: insertedJournals[0].journal._id.toString(),
        title: "collaborative face mask",
        text: "some other thing",
        tags: ["spartan", "taxonomy", "Pretoria"],
      },
      {
        ownerId: mockUser._id.toString(),
        parentJournalId: insertedJournals[0].journal._id.toString(),
        title: "at best leave",
        text: "some other thing atop",
        tags: ["nutrition", "clickable", "loam", "weird funky"],
      },
    ];

    const testJournal = await JournalModel.findById(
      insertedJournals[0].journal._id.toString()
    );
    testJournal.journalEntries = journalEntries as IJournalEntry[];
    await testJournal.save();

    const obj = testJournal.getTagAggregator();
    expect(obj.tags.length).toBe(11);
  });
  test("aggregation tallies are working", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "hi@email.com",
      firstName: "f",
      lastName: "ln",
      plainTextPassword: "pwd1234565",
    });

    const testJournals = [
      {
        ownerId: mockUser._id.toString(),
        description: "test-unique-id",
        tags: ["abc", "tag2"],
        title: "E pluribus unum",
      },
    ];

    const insertedJournals = await Promise.all(
      testJournals.map((j) => JournalModel.createJournalForUserId(j))
    );
    const journalEntries = [
      {
        ownerId: mockUser._id.toString(),
        parentJournalId: insertedJournals[0].journal._id.toString(),
        title: "super california",
        text: "some desc",
        tags: ["arg", "nature walk park"],
      },
      {
        ownerId: mockUser._id.toString(),
        parentJournalId: insertedJournals[0].journal._id.toString(),
        title: "collaborative face mask",
        text: "some other thing",
        tags: ["arg", "taxonomy", "Pretoria"],
      },
      {
        ownerId: mockUser._id.toString(),
        parentJournalId: insertedJournals[0].journal._id.toString(),
        title: "at best leave",
        text: "some other thing atop",
        tags: ["nutrition", "arg", "loam", "weird funky"],
      },
    ];

    const testJournal = await JournalModel.findById(
      insertedJournals[0].journal._id.toString()
    );
    testJournal.journalEntries = journalEntries as IJournalEntry[];
    await testJournal.save();
    const stats = testJournal.getTagAggregator().getAggregation();
    expect(stats["arg"]).toBe(3);
  });

  test("count tags works properly", () => {
    const mockTags = ["t1", "t1", "t2", "t3", "t3", "t3"];
    const res = countTags(mockTags);
    expect(res).toEqual({
      t1: 2,
      t2: 1,
      t3: 3,
    });
  });
});
