import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

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

test("user profile update test", async () => {
  const mockUser = await getMockUser();
  const refreshedUser = await mockUser.updateFirstNameLastName({
    firstName: "newfn",
    lastName: "newln",
  });

  expect(refreshedUser.firstName).toBe("newfn");
  expect(refreshedUser.lastName).toBe("newln");
});
