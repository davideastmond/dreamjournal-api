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

describe("journal find tests", () => {
  test("journal model function to find journals by array of ids works properly", async () => {
    const dummyUser = await getMockUser();

    const journal1 = await JournalModel.createJournalEntryForUserId({
      ownerId: dummyUser._id.toString(),
      title: "journal1",
      description: "desc journal1",
    });
    const journal2 = await JournalModel.createJournalEntryForUserId({
      ownerId: dummyUser._id.toString(),
      title: "journal2",
      description: "secondJ some kind of data for desc",
    });
    const journal3 = await JournalModel.createJournalEntryForUserId({
      ownerId: dummyUser._id.toString(),
      title: "journal3 my j",
      description: "third some kind of wonderful journal for desc 3",
      tags: ["some", "kind", "of", "wonderful"],
    });

    const ids = [
      journal1.journal._id.toString(),
      journal2.journal._id.toString(),
      journal3.journal._id.toString(),
    ];
    const foundJournals = await JournalModel.findManyById(ids);
    expect(foundJournals).toHaveLength(3);
    expect(foundJournals[2].tags).toEqual(["some", "kind", "of", "wonderful"]);
  });
});
