import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { JournalModel } from "../../models/journal/journal.schema";
import { mongoTestOptions } from "../../test-helpers/mongo-test.config";
import { getMockUser } from "../utils/mock-user";

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

describe("Journal create", () => {
  test("create new journal entry for journal", async () => {
    const mockUser = await getMockUser();
    const mockJournal = await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["tag1", "tag2"],
      title: "my journal",
    });

    await mockJournal.journal.addNewEntry({
      title: "testTitle",
      description: "testDesc",
      text: "hi",
      tags: [],
    });

    const updatedJournal = await JournalModel.findById(
      mockJournal.journal._id.toString()
    );
    expect(updatedJournal.journalEntries.length).toBe(1);
    expect(updatedJournal.journalEntries[0].title).toBe("testTitle");
  });
});
