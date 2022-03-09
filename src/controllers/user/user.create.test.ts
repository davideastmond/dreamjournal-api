import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { UserModel } from "../../models/user/user.schema";
import { mongoTestOptions } from "../../test-helpers/mongo-test.config";
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

describe("create user tests", () => {
  test("creates new user properly", async () => {
    const newUser = {
      email: "test@example.com",
      firstName: "firstName",
      lastName: "lastName",
      plainTextPassword: "somenewpassword123",
    };
    const createdUser = await UserModel.createUniqueUser(newUser);
    expect(createdUser.email).toBe(newUser.email);
    expect(createdUser.firstName).toBe(newUser.firstName);
    expect(createdUser.lastName).toBe(newUser.lastName);
    const validPassword = await checkPassword({
      hashedPassword: createdUser.hashedPassword,
      plainTextPassword: newUser.plainTextPassword,
    });
    expect(validPassword).toBe(true);
  });
});
