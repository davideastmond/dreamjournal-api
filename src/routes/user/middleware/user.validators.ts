import { checkSchema, param } from "express-validator";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { isURLValid } from "../../../utils/string-validation/url-valid";

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
