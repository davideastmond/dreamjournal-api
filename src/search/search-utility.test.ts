import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { mongoTestOptions } from "../test-helpers/mongo-test.config";
import { JournalModel } from "../models/journal/journal.schema";
import { UserModel } from "../models/user/user.schema";
import { QuerySearch } from "./search-utility";

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

describe("Search utility tests - Journals", () => {
  test("gets results by journal title", async () => {
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
        journalEntries: [
          {
            title: "super california",
            tags: ["arg", "nature walk park"],
          },
        ],
      },
      {
        ownerId: mockUser._id.toString(),
        description: "some description",
        tags: ["ghi", "klm"],
        title: "Seven long years",
        journalEntries: [
          {
            title: "In case there were waves on the crashing",
            tags: ["Spencer", "Publications", "Milestone"],
          },
          {
            title: "Interesting squirrel used for bat pitcher",
            tags: ["Rodent", "sewer", "climbing"],
          },
        ],
      },
      {
        ownerId: mockUser._id.toString(),
        description: "some description",
        tags: ["tag1", "tag2"],
        title: "unum court case",
      },
    ];
    await Promise.all(
      testJournals.map((j) => JournalModel.createJournalForUserId(j))
    );

    await JournalModel.find();
    const query = new QuerySearch("pluribus");
    const results = await query.getResults();
    expect(results.journals.length).toBe(1);
    expect(results.journals[0].journal.description).toBe("test-unique-id");
    expect(results.journals[0].journal.title).toBe("E pluribus unum");
    expect(results.queryString).toBe("pluribus");

    const tagQuery = new QuerySearch("tag2");
    const tagQueryResults = await tagQuery.getResults();
    expect(tagQueryResults.journals.length).toBe(2);

    const entriesQuery = new QuerySearch("crashing");
    const entriesResults = await entriesQuery.getResults();
    console.log(entriesResults);
  });
});
