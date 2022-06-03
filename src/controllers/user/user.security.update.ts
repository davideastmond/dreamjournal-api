import { TUserSecurityQuestionsPutRequestData } from "../../models/user";
import { IUserDocument, TSecurityQuestion } from "../../models/user/user.types";
import { hashPassword } from "../../utils/crypto/crypto";

export async function updateUserPassword(
  this: IUserDocument,
  plainTextPassword: string
): Promise<void> {
  const pwdHash = await hashPassword({ password: plainTextPassword });
  this.hashedPassword = pwdHash;
  await this.save();
}

export async function insertSecurityQuestionsForUser(
  this: IUserDocument,
  data: TUserSecurityQuestionsPutRequestData
): Promise<void> {
  const decomposedQuestions: Array<TSecurityQuestion> = Object.values(data).map(
    (segment) => {
      return {
        question: {
          id: segment.selectedQuestionId,
          prompt: segment.selectedQuestionPrompt,
        },
        answer: segment.response,
      };
    }
  );

  this.security.recoveryQuestions = decomposedQuestions;
  this.security.isSet = true;

  this.markModified("security");
  await this.save();
}
