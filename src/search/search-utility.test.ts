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
      dateOfBirth: new Date().toDateString(),
    });

    const testJournals = [
      {
        ownerId: mockUser._id.toString(),
        description: "test-unique-id",
        tags: ["abc", "tag2"],
        title: "E pluribus unum",
        journalEntries: [] as any[],
      },
      {
        ownerId: mockUser._id.toString(),
        description: "some description",
        tags: ["ghi", "klm"],
        title: "Seven long years",
        journalEntries: [] as any[],
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

    const journals = await JournalModel.find();
    const mockJournalEntries = [
      {
        title: "super california",
        tags: ["arg", "nature walk park"],
        text: "something",
        description: "some other type of description",
      },
      {
        title: "In case there were waves on the crashing tag2",
        tags: ["Spencer", "Publications", "Milestone"],
        text: "description",
        description: "null",
      },
      {
        title: "Interesting squirrel used for bat pitcher",
        tags: ["Rodent", "sewer", "climbing", "description"],
        text: "null",
        ownerId: mockUser._id.toString(),
      },
    ] as any[];
    await journals[0].addNewEntry(mockJournalEntries[0]);
    await journals[1].addNewEntry(mockJournalEntries[1]);
    await journals[1].addNewEntry(mockJournalEntries[2]);

    const query = new QuerySearch("pluribus", mockUser._id.toString());
    const results = await query.getResults();
    expect(results.journals.length).toBe(1);
    expect(results.journals[0].journal.description).toBe("test-unique-id");
    expect(results.journals[0].journal.title).toBe("E pluribus unum");
    expect(results.queryString).toBe("pluribus");
    expect(
      results.journals.every(
        (journal) => journal.journal.ownerId === mockUser._id.toString()
      )
    ).toBe(true);

    const tagQuery = new QuerySearch("tag2", mockUser._id.toString());
    const tagQueryResults = await tagQuery.getResults();
    expect(tagQueryResults.journals.length).toBe(3);
    expect(tagQueryResults.journalEntries[0].matchedBy).toBe(
      "journalEntryTitle"
    );

    const otherQuery = new QuerySearch("description", mockUser._id.toString());
    const additionalResults = await otherQuery.getResults();
    expect(additionalResults.journalEntries).toHaveLength(3);
    expect(additionalResults.journalEntries[0].matchedBy).toBe(
      "journalEntryText"
    );
    expect(additionalResults.journalEntries[1].matchedBy).toBe(
      "journalEntryTags"
    );
    expect(additionalResults.journalEntries[2].matchedBy).toBe(
      "journalEntryDescription"
    );

    // Drop the indexes and force a manual search
    await JournalModel.collection.dropIndexes();
    const yetAnotherQuery = new QuerySearch(
      "description",
      mockUser._id.toString()
    );
    const moreResults = await yetAnotherQuery.getResults();
    expect(moreResults.otherInfo).toBe("non-index result");
  });
});
