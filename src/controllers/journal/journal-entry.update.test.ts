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

      expect(res.actionsTaken[0].field).toBeDefined();
      expect(res.actionsTaken.length).toBe(1);
      expect(res.actionsTaken[0].field).toBe("title");
      expect(res.actionsTaken[0].action).toBe("update");
      expect(res.actionsTaken[0].data).toBe("1234NewData");
    });
    test("title update procedure missing journalId expect to throw | illegal delete procedure", async () => {
      const updates = {
        title: {
          action: "update",
          data: "1234NewData",
        },
      };
      await expect(() =>
        mockJournal.journal.patchJournalEntryAttributes(updates)
      ).rejects.toThrow();

      await expect(() =>
        mockJournal.journal.patchJournalEntryAttributes({
          ...updates,
          title: { action: "delete", data: "blahblah" },
          journalEntryId: mockEntry._id.toString(),
        })
      ).rejects.toThrow();
    });
  });

  describe("tags test", () => {
    test("tags updating properly", async () => {
      const updates = {
        tags: {
          action: "update",
          data: ["newTag", "threeTags"],
        },
        journalEntryId: mockEntry._id.toString(),
      };
      await mockJournal.journal.patchJournalEntryAttributes(updates);

      console.log("mockJournal", mockJournal);
      const refreshedJournal = await JournalModel.findById(
        mockJournal.journal._id.toString()
      );
      console.log("refreshed journal", refreshedJournal);
    });
  });
});
