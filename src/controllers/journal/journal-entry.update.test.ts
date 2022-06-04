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

describe("journalEntry update", () => {
  let mockUser: any;
  let mockJournal: any;
  let mockEntry: any;
  beforeEach(async () => {
    mockUser = await getMockUser();
    mockJournal = await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["zip", "zap", "zop"],
      title: "my journal 3",
    });
    await mockJournal.journal.addNewEntry({
      title: "testTitle1",
      description: "pears",
      text: "hi dikl",
      tags: [],
    });
    await mockJournal.journal.addNewEntry({
      title: "testTitle2",
      description: "peaches",
      text: "hi immer noch",
      tags: [],
    });
    mockEntry = await mockJournal.journal.addNewEntry({
      title: "testTitle3",
      description: "Apple",
      text: "Wir sind Wir!",
      tags: [],
    });
  });

  describe("Update title", () => {
    test("updates title", async () => {
      const updates = {
        title: {
          action: "update",
          data: "1234NewData",
        },
        journalEntryId: mockEntry._id.toString(),
      };
      const res = await mockJournal.journal.patchJournalEntryAttributes(
        updates
      );
      console.log("res", res);
      console.log(mockUser, mockJournal, mockEntry);
    });
  });
});
