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

describe("User find own journal tests", () => {
  test("instance method for finding user's own journals works properly", async () => {
    const dummyUser = await UserModel.createUniqueUser({
      firstName: "fn",
      lastName: "ln",
      email: "email@email.com",
      plainTextPassword: "pwd123",
    });

    await JournalModel.createJournalForUserId({
      ownerId: dummyUser._id.toString(),
      title: "journal1",
      description: "desc journal1",
    });
    await JournalModel.createJournalForUserId({
      ownerId: dummyUser._id.toString(),
      title: "journal2",
      description: "secondJ some kind of data for desc",
    });
    const journal3 = await JournalModel.createJournalForUserId({
      ownerId: dummyUser._id.toString(),
      title: "journal3 my j",
      description: "third some kind of wonderful journal for desc 3",
      tags: ["some", "kind", "of", "wonderful"],
    });

    const refreshedUser = await UserModel.findById(dummyUser._id);
    const foundJournals = await refreshedUser.getAllJournals();
    expect(foundJournals).toHaveLength(3);
    expect(foundJournals[2].tags).toEqual(["some", "kind", "of", "wonderful"]);
    expect(foundJournals[2]._id.toString()).toBe(
      journal3.journal._id.toString()
    );
  });
  test("returns empty array when there are no journalIds on the user document", async () => {
    const mockUser = await UserModel.createUniqueUser({
      firstName: "fn",
      lastName: "ln",
      email: "email@email.com",
      plainTextPassword: "pwd123",
    });
    const res = await mockUser.getAllJournals();
    expect(res).toEqual([]);
  });
});
