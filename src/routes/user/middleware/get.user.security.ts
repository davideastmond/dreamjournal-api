import { Request, Response } from "express";
import { UserModel } from "../../../models/user/user.schema";
import { IUserDocument } from "../../../models/user/user.types";
export const returnUsersSecurityQuestionsIfAny = async (
  req: Request,
  res: Response
) => {
  /**
   * This middleware sends the users' chosen security questions.
   * we won't send any responses over the network
   * if user has no security questions chosen, send an object that indicates this
   */
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send({ error: "User not found" });
    const { security } = user;
    if (
      security.recoveryQuestions &&
      security.recoveryQuestions.length &&
      security.recoveryQuestions.length > 0
    ) {
      const recoveryQuestionsWithoutAnswers = security.recoveryQuestions.map(
        (q) => q.question
      );
      return res.status(201).send({
        isSet: true,
        questions: recoveryQuestionsWithoutAnswers,
      });
    }
    const defaultSecurityQuestionData =
      await createEmptySecurityQuestionPropertyOnUserDocument(user);
    return res.status(201).send(defaultSecurityQuestionData);
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
};

export const getTwoFactorAuthStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findById(userId);
    if (user) {
      return res.status(200).send({
        twoFactorAuthentication: {
          enabled: user.security.twoFactorAuthentication.enabled || false,
        },
      });
    }
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
};

async function createEmptySecurityQuestionPropertyOnUserDocument(
  user: IUserDocument
): Promise<any> {
  const emptySettings: any = {
    isSet: false,
    recoveryQuestions: [],
  };
  user.security = emptySettings;
  user.markModified("security");
  await user.save();
  return emptySettings;
}
