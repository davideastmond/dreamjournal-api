import { Response } from "express";
import { SECURITY_QUESTION_TEMPLATES } from "../../../models/user";

export const sendSecurityQuestionPrompts = async (_: any, res: Response) => {
  // This sends the list of possible security questions and the associated question id
  return res.status(200).send(SECURITY_QUESTION_TEMPLATES);
};
