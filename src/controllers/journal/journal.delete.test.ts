import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { JournalModel } from "../../models/journal/journal.schema";
import { UserModel } from "../../models/user/user.schema";

import { mongoTestOptions } from "../../test-helpers/mongo-test.config";

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

describe("journal delete tests", () => {
  test("deletes the journal by id and returns correct metadata", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "hi@email.com",
      firstName: "f",
      lastName: "ln",
      plainTextPassword: "pwd1234565",
    });
    const journal1 = await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["1", "2", "3", "4", "5", "6"],
      title: "adventures in dream land",
    });
    await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["zip", "zap", "zop"],
      title: "my journal 3",
    });
    await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["tag1", "tag2"],
      title: "my journal 3",
    });

    const result = await JournalModel.findByJournalIdAndDelete({
      journalId: journal1.journal._id.toString(),
      requestorId: mockUser._id.toString(),
    });
    expect(Object.keys(result.user.journalIds)).toHaveLength(2);
    expect(result.info.actionTaken).toBe("delete");
    expect(result.info.deletedJournalId).toBe(journal1.journal._id.toString());
    expect(result.info.otherInfo).toBe("Action was successfully completed");
    const deleteJournal = await JournalModel.findById(
      journal1.journal._id.toString()
    );
    expect(deleteJournal).toBeUndefined;
  });
  test("journal id doesn't exist in the user's journalIds object, expect appropriate metadata from the result", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "hi@email.com",
      firstName: "f",
      lastName: "ln",
      plainTextPassword: "pwd1234565",
    });
    const journal1 = await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["1", "2", "3", "4", "5", "6"],
      title: "adventures in dream land",
    });
    await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["zip", "zap", "zop"],
      title: "my journal 3",
    });
    await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["tag1", "tag2"],
      title: "my journal 3",
    });

    // Let's delete journal1's id from the user, but not delete it from the journal collection
    delete mockUser.journalIds[`${journal1.journal._id.toString()}`];
    mockUser.markModified("journalIds");
    await mockUser.save();

    const result = await JournalModel.findByJournalIdAndDelete({
      journalId: journal1.journal._id.toString(),
      requestorId: mockUser._id.toString(),
    });
    expect(result.info.actionTaken).toBe("delete");
    expect(result.info.otherInfo).toBe("id was not found on the user document");
  });
  test("rejects and throws error", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "hi@email.com",
      firstName: "f",
      lastName: "ln",
      plainTextPassword: "pwd1234565",
    });
    await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["1", "2", "3", "4", "5", "6"],
      title: "adventures in dream land",
    });
    await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["zip", "zap", "zop"],
      title: "my journal 3",
    });
    await JournalModel.createJournalEntryForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["tag1", "tag2"],
      title: "my journal 3",
    });

    const mockJournalId = new mongoose.Types.ObjectId();
    const mockUserId = new mongoose.Types.ObjectId();
    await expect(() =>
      JournalModel.findByJournalIdAndDelete({
        journalId: mockJournalId.toString(),
        requestorId: mockUserId.toString(),
      })
    ).rejects.toThrow();
  });
});
