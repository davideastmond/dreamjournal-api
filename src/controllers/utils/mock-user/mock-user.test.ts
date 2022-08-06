import { getMockUser } from "./mock-user";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../../test-helpers/mongo-test.config";

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
describe("get mockUser tests", () => {
  test("creates mockUser document with email address indicated in params", async () => {
    const mockUser = await getMockUser("testEmail@example.com");
    expect(mockUser.email).toBe("testEmail@example.com");
  });
  test("creates user with default email (not specified)", async () => {
    const mockUser = await getMockUser();
    expect(mockUser.email).toBe("email@email.com");
  });
});
