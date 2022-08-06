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

describe("create new journal tests", () => {
  test("creates new journal successfully | throws if invalid ownerId", async () => {
    const mockUser = await UserModel.createUniqueUser({
      email: "hi@email.com",
      firstName: "f",
      lastName: "ln",
      plainTextPassword: "pwd1234565",
      dateOfBirth: new Date().toDateString(),
    });
    const result = await JournalModel.createJournalForUserId({
      ownerId: mockUser._id.toString(),
      description: "some description",
      tags: ["tag1", "tag2"],
      title: "my journal",
    });
    expect(result.user._id.toString()).toBe(mockUser._id.toString());
    expect(result.journal.ownerId).toBe(mockUser._id.toString());
    expect(result.user.journalIds[result.journal._id.toString()]).toBeDefined();
    expect(result.journal.description).toBe("some description");
    expect(result.journal.title).toBe("my journal");
    expect(result.journal.tags.length).toBe(2);
    expect(result.journal.tags[1]).toBe("tag2");

    const fakeUserId = new mongoose.Types.ObjectId().toString();
    await expect(() =>
      JournalModel.createJournalForUserId({
        ownerId: fakeUserId,
        description: "some description",
        tags: ["tag1", "tag2"],
        title: "my journal",
      })
    ).rejects.toThrow();
  });
  test("throws if duplicate user id email", async () => {
    await UserModel.createUniqueUser({
      email: "unique@email.com",
      firstName: "f",
      lastName: "ln",
      plainTextPassword: "pwd1234565",
      dateOfBirth: new Date().toDateString(),
    });
    await expect(() =>
      UserModel.createUniqueUser({
        email: "unique@email.com",
        firstName: "otherfn",
        lastName: "otherln",
        plainTextPassword: "pwd1234565",
        dateOfBirth: new Date().toDateString(),
      })
    ).rejects.toThrow();
  });
});
