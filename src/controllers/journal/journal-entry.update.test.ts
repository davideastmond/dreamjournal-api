import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { JournalModel } from "../../models/journal/journal.schema";
import {
  TNewJournalReturnData,
  TUpdateAction,
} from "../../models/journal/journal.types";
import { IUserDocument } from "../../models/user/user.types";
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
  let mockUser: IUserDocument;
  let mockJournal: TNewJournalReturnData;
  beforeEach(async () => {
    mockUser = await getMockUser("testEmailInstance@email.com");

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
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("Update title", () => {
    test("updates title", async () => {
      const spy = jest.spyOn(JournalModel, "updateOne");
      const mockEntry = await mockJournal.journal.addNewEntry({
        title: "testTitle3",
        description: "Apple",
        text: "Wir sind Wir!",
        tags: [],
      });
      const updates = {
        title: {
          action: "update" as TUpdateAction,
          data: "1234NewData",
        },
        journalEntryId: mockEntry._id.toString(),
      };
      const res = await mockJournal.journal.patchJournalEntryAttributes(
        updates
      );
      expect(spy).toBeCalled();
      expect(res.actionsTaken[0].field).toBeDefined();
      expect(res.actionsTaken.length).toBe(1);
      expect(res.actionsTaken[0].field).toBe("title");
      expect(res.actionsTaken[0].action).toBe("update");
      expect(res.actionsTaken[0].data).toBe("1234NewData");
    });
    test("title update procedure missing journalId expect to throw | illegal delete procedure", async () => {
      const mockEntry = await mockJournal.journal.addNewEntry({
        title: "testTitle3",
        description: "Apple",
        text: "Wir sind Wir!",
        tags: [],
      });
      const updates = {
        title: {
          action: "update" as TUpdateAction,
          data: "1234NewData",
        },
      };
      await expect(() =>
        mockJournal.journal.patchJournalEntryAttributes(updates as any)
      ).rejects.toThrow();

      await expect(() =>
        mockJournal.journal.patchJournalEntryAttributes({
          ...updates,
          title: { action: "delete", data: "blahblah" },
          journalEntryId: mockEntry._id.toString(),
        })
      ).rejects.toThrow();
    });
    test("tags updating properly", async () => {
      const mockEntry = await mockJournal.journal.addNewEntry({
        title: "testTitle3",
        description: "Apple",
        text: "Wir sind Wir!",
        tags: [],
      });

      const updates = {
        tags: {
          action: "update" as TUpdateAction,
          data: ["newTag", "threeTags"],
        },
        journalEntryId: mockEntry._id.toString(),
      };
      const res = await mockJournal.journal.patchJournalEntryAttributes(
        updates
      );
      expect(res.actionsTaken).toBeDefined();
      expect(Array.isArray(res.actionsTaken)).toBe(true);
      expect(res.actionsTaken[0].field).toBe("tags");
      expect(res.actionsTaken[0].data).toEqual(updates.tags.data);
    });
    test("testing multi-operations deleting tags and updating text", async () => {
      const mockEntry = await mockJournal.journal.addNewEntry({
        title: "testTitle3",
        description: "Apple",
        text: "initial text",
        tags: ["first", "second", "third"],
      });
      const updates = {
        tags: {
          action: "delete" as TUpdateAction,
        },
        text: {
          action: "update" as TUpdateAction,
          data: "new updated text",
        },
        journalEntryId: mockEntry._id.toString(),
      };
      const res = await mockJournal.journal.patchJournalEntryAttributes(
        updates
      );
      expect(res.actionsTaken).toHaveLength(2);
      expect(res.actionsTaken[0].action).toBe("delete");
      expect(res.actionsTaken[1].action).toBe("update");
      expect(res.actionsTaken[1].data).toBe("new updated text");
    });
    test("deleting text, description and photoUrl", async () => {
      const mock = jest.spyOn(JournalModel, "updateOne");
      const mockEntry = await mockJournal.journal.addNewEntry({
        title: "testTitle3",
        description: "Apple",
        text: "initial text",
        tags: ["first", "second", "third"],
        photoUrl: "https://www.example.com/myimage.url",
      });
      const updates = {
        text: {
          action: "delete" as TUpdateAction,
        },
        description: {
          action: "delete" as TUpdateAction,
        },
        photoUrl: {
          action: "delete" as TUpdateAction,
        },
        journalEntryId: mockEntry._id.toString(),
      };
      const res = await mockJournal.journal.patchJournalEntryAttributes(
        updates
      );
      expect(res.actionsTaken).toHaveLength(3);
      const newUpdates = {
        description: {
          action: "update" as TUpdateAction,
          data: "some new description",
        },
        photoUrl: {
          action: "update" as TUpdateAction,
          data: "https://www.example.com/new.jpg",
        },
        journalEntryId: mockEntry._id.toString(),
      };
      const res2 = await mockJournal.journal.patchJournalEntryAttributes(
        newUpdates
      );
      expect(res2.actionsTaken).toHaveLength(2);
      expect(mock).toHaveBeenCalledTimes(5);
    });
    test("empty actions reflect properly", async () => {
      const mockEntry = await mockJournal.journal.addNewEntry({
        title: "testTitle3",
        description: "Apple",
        text: "initial text",
        tags: ["first", "second", "third"],
        photoUrl: "https://www.example.com/myimage.url",
      });
      const updates: any = {
        journalEntryId: mockEntry._id.toString(),
      };
      const res = await mockJournal.journal.patchJournalEntryAttributes(
        updates
      );
      expect(res.actionsTaken[0].field).toBe("no changes");
      expect(res.actionsTaken[0].action).toBeNull();
      expect(res.journal).toBeNull();
    });
  });
});
