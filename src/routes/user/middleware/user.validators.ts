import { body, checkSchema, param } from "express-validator";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { isURLValid } from "../../../utils/string-validation/url-valid";
import { SECURITY_QUESTION_TEMPLATES } from "../../../models/user/user.security.data";
import { isPhoneNumberValid } from "../../../controllers/two-factor-authentication-controller/utils";
import dayjs from "dayjs";

const SECURITY_IDS = SECURITY_QUESTION_TEMPLATES.map((template) => template.id);
const MINIMUM_RESPONSE_CHARACTER_COUNT = 4;

export const mongooseUserIdValidator = (): any[] => {
  return [
    param("userId")
      .exists()
      .custom(async (value: string) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return Promise.reject("User id is invalid");
        }
      }),
  ];
};

// This makes sure that the requestor has an authenticated session and is only accessing their own information
export const restrictedAccessToSessionUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  if (process.env.NODE_ENV && process.env.NODE_ENV.match("test")) {
    next();
    return;
  }
  if (!userId)
    return res
      .status(401)
      .send({ error: "Private session: userId parameter not defined" });

  const { session } = res.locals;
  if (!session)
    return res
      .status(401)
      .send({ error: "Private session: can't find session" });
  if (session._id !== userId)
    return res
      .status(401)
      .send({ error: "Not authorized: userId-sessionId mismatch" });
  next();
};

export const mongooseJournalEntryIdValidator = (): any[] => {
  return [
    param("journalId")
      .exists()
      .custom(async (value: string) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return Promise.reject("Journal id is invalid");
        }
      }),
  ];
};

export function newJournalValidator(): any {
  return [
    checkSchema({
      title: {
        exists: true,
        isString: true,
        trim: true,
        isLength: {
          options: [{ min: 1 }],
        },
        errorMessage: "`title` must be a string, exist and must",
      },
      description: {
        custom: {
          options: (value) => {
            if (!value) return true;
            if (value.trim() === "" || value.length === 0) return false;
            return true;
          },
          errorMessage: "Description is an empty string or of length 0",
        },
      },
      photoUrl: {
        custom: {
          options: (value) => {
            if (!value) return true;
            if (value.trim() === "" || value.length === 0) return false;
            if (!isURLValid(value)) return false;
            return true;
          },
          errorMessage: "PhotoUrl must be in a valid url format",
        },
      },
      tags: {
        custom: {
          options: (value) => {
            if (!value) return true;
            if (Array.isArray(value)) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
    }),
  ];
}

export const userPasswordUpdateValidator = (): any[] => {
  return [body("password").exists().trim().escape()];
};

export const userBasicProfileUpdateValidator = (): any[] => {
  return [
    body("firstName").exists().trim().escape(),
    body("lastName").exists().trim().escape(),
    body("dateOfBirth")
      .exists()
      .custom((value) => {
        const dateObject = dayjs(value);
        return dayjs(dateObject, "MMM-DD-YYYY", true).isValid();
      }),
  ];
};

export const newSecurityQuestionsValidator = (): any[] => {
  return [
    checkSchema({
      "q0": {
        exists: true,
        errorMessage: "q0 parameter must exist and be a string",
      },
      "q0.selectedQuestionId": {
        exists: true,
        custom: {
          options: (value) => {
            return SECURITY_IDS.includes(value);
          },
        },
      },
      "q0.selectedQuestionPrompt": {
        exists: true,
      },
      "q0.id": {
        exists: true,
      },
      "q0.response": {
        trim: true,
        escape: true,
        isLength: {
          options: [{ min: MINIMUM_RESPONSE_CHARACTER_COUNT }],
          errorMessage: `Response length for q0 should be at least ${MINIMUM_RESPONSE_CHARACTER_COUNT} characters`,
        },
      },
      q1: {
        exists: true,
        errorMessage: "q1 parameter must exist and be a string",
      },
      "q1.selectedQuestionId": {
        exists: true,
        custom: {
          options: (value) => {
            return SECURITY_IDS.includes(value);
          },
        },
      },
      "q1.selectedQuestionPrompt": {
        exists: true,
      },
      "q1.id": {
        exists: true,
      },
      "q1.response": {
        escape: true,
        isLength: {
          options: [{ min: MINIMUM_RESPONSE_CHARACTER_COUNT }],
          errorMessage: `Response length for q1 should be at least ${MINIMUM_RESPONSE_CHARACTER_COUNT} characters`,
        },
      },
      q2: {
        exists: true,
        errorMessage: "q2 parameter must exist and be a string",
      },
      "q2.selectedQuestionId": {
        exists: true,
        custom: {
          options: (value) => {
            return SECURITY_IDS.includes(value);
          },
        },
      },
      "q2.selectedQuestionPrompt": {
        exists: true,
      },
      "q2.id": {
        exists: true,
      },
      "q2.response": {
        isString: true,
        trim: true,
        escape: true,
        isLength: {
          options: [{ min: MINIMUM_RESPONSE_CHARACTER_COUNT }],
          errorMessage: `Response length for q2 should be at least ${MINIMUM_RESPONSE_CHARACTER_COUNT} characters`,
        },
      },
    }),
  ];
};

export const twoFactorAuthCTNBodyValidator = (): any[] => {
  return [
    body("ctn")
      .exists()
      .custom((value) => {
        return isPhoneNumberValid(value);
      }),
  ];
};

export const twoFactorPlainTextPasswordValidator = (): any[] => {
  return [body("plainTextPassword").exists().isString()];
};
