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

describe("Journal Analytics tests", () => {
  test("count all tags functionality works", async () => {
    const user = await getMockUser();
    await JournalModel.createJournalForUserId({
      ownerId: user._id.toString(),
      description: "some description",
      tags: ["tag1", "tag2"],
      title: "my journal-1",
    });
    await JournalModel.createJournalForUserId({
      ownerId: user._id.toString(),
      description: "some description",
      tags: ["tag1", "tag3"],
      title: "my journal-2",
    });
    await JournalModel.createJournalForUserId({
      ownerId: user._id.toString(),
      description: "some description",
      tags: ["tag1", "tag8"],
      title: "my journal-3",
    });

    const res = await JournalModel.countAllTags(user._id.toString());
    expect(res.journalCount).toBe(3);
  });
  test("countAllTags method throws error if no journal", async () => {
    const mockUser = await getMockUser();
    await expect(() =>
      JournalModel.countAllTags(mockUser._id.toString())
    ).rejects.toThrow();
  });
});
