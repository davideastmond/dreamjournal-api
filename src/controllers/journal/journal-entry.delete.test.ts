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

describe("journalEntry delete tests", () => {
  test("Deletes entry from journal properly | rejects to throw if invalid journalEntry id", async () => {
    const mockUser = await getMockUser();
    const mockJournal = await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["tag1", "tag2"],
      title: "my journal",
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
    await mockJournal.journal.addNewEntry({
      title: "testTitle3",
      description: "Apple",
      text: "Wir sind Wir!",
      tags: [],
    });
    expect(mockJournal.journal.journalEntries).toHaveLength(3);
    const targetJournalEntryId = (
      mockJournal.journal.journalEntries[2] as any
    )._id.toString();
    const res = await mockJournal.journal.deleteEntry(targetJournalEntryId);
    expect(res.journal.journalEntries.length).toBe(2);
    expect(res.action).toBe("delete");
    expect(res.deletedJournalEntryId).toBe(targetJournalEntryId);
    expect(res.journal._id.toString()).toBe(mockJournal.journal._id.toString());

    const remainingIds = res.journal.journalEntries.map((entry: any) =>
      entry._id.toString()
    );
    expect(remainingIds.includes(targetJournalEntryId)).toBe(false);
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(() =>
      mockJournal.journal.deleteEntry(fakeId)
    ).rejects.toThrow();
  });
});
