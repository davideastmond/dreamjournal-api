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

describe("journal attributes patch tests", () => {
  describe("patch some data", () => {
    test("patch the title only", async () => {
      const dummyUser = await getMockUser();
      const journal = await JournalModel.createJournalEntryForUserId({
        ownerId: dummyUser._id.toString(),
        title: "journal1",
        description: "desc journal1",
      });
      const patchData = await journal.journal.patchJournalAttributes({
        title: {
          action: "update",
          data: "newly updated title",
        },
      });
      expect(patchData.actionsTaken).toEqual([
        { "action": "update", "field": "title" },
      ]);
      expect(patchData.journal.title).toBe("newly updated title");
    });
    test("patch the tags and description, delete the photo", async () => {
      const dummyUser = await getMockUser();
      const journal = await JournalModel.createJournalEntryForUserId({
        ownerId: dummyUser._id.toString(),
        title: "journal1",
        description: "desc journal1",
        photoUrl: "http://www.zone.com/photo.jpg",
      });
      const patchData = await journal.journal.patchJournalAttributes({
        tags: {
          action: "update",
          data: ["tag3", "tag4"],
        },
        description: {
          action: "update",
          data: "some new description",
        },
        photoUrl: {
          action: "delete",
        },
      });
      expect(patchData.journal.tags).toEqual(["tag3", "tag4"]);
      expect(patchData.actionsTaken).toEqual([
        { field: "tags", action: "update" },
        { field: "description", action: "update" },
        { field: "photoUrl", action: "delete" },
      ]);
      expect(patchData.journal.photoUrl).toBe("");
    });
  });
});
