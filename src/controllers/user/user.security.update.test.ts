import { getMockUser } from "../utils/mock-user";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../test-helpers/mongo-test.config";
import { UserModel } from "../../models/user/user.schema";
import { checkPassword } from "../../utils/crypto/crypto";

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

describe("security: updateUserPassword tests", () => {
  test("update user password works", async () => {
    const user = await getMockUser();
    const testPlainTextPassword = "arkelles123";
    await user.updateUserPassword(testPlainTextPassword);

    const refreshedUser = await UserModel.findById(user._id.toString());
    const validate = await checkPassword({
      hashedPassword: refreshedUser.hashedPassword,
      plainTextPassword: testPlainTextPassword,
    });
    expect(validate).toBe(true);
  });
});
