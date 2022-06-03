import { getMockUser } from "../utils/mock-user";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mongoTestOptions } from "../../test-helpers/mongo-test.config";
import { UserModel } from "../../models/user/user.schema";
import { checkPassword } from "../../utils/crypto/crypto";
import { TUserSecurityQuestionsPutRequestData } from "../../models/user";

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

describe("insertSecurityQuestions tests", () => {
  test("insert security questions for user", async () => {
    const user = await getMockUser();

    const sampleInput: TUserSecurityQuestionsPutRequestData = {
      q0: {
        selectedQuestionId: "A0",
        selectedQuestionPrompt: "q0 prompt",
        id: "test",
        response: "test response 0",
      },
      q1: {
        selectedQuestionId: "A1",
        selectedQuestionPrompt: "q1 prompt",
        id: "test",
        response: "test response 1",
      },
      q2: {
        selectedQuestionId: "A2",
        selectedQuestionPrompt: "q2 prompt",
        id: "test",
        response: "test response 2",
      },
    };

    await user.insertSecurityQuestionsForUser(sampleInput);
    const refreshedUser = await UserModel.findById(user._id.toString());
    expect(refreshedUser.security.isSet).toBe(true);
    expect(refreshedUser.security.recoveryQuestions.length).toBe(3);
    expect(refreshedUser.security.recoveryQuestions[0]).toHaveProperty(
      "question"
    );
    expect(refreshedUser.security.recoveryQuestions[0]).toHaveProperty(
      "answer"
    );
    expect(refreshedUser.security.recoveryQuestions[0].question).toHaveProperty(
      "id"
    );
    expect(refreshedUser.security.recoveryQuestions[0].question).toHaveProperty(
      "prompt"
    );
    expect(refreshedUser.security.recoveryQuestions[0].question.prompt).toBe(
      "q0 prompt"
    );
    expect(refreshedUser.security.recoveryQuestions[2].answer).toBe(
      "test response 2"
    );
  });
});
