import { checkSchema, param } from "express-validator";
import mongoose from "mongoose";
import { isURLValid } from "../../../utils/string-validation/url-valid";

export const mongooseJournalIdValidator = (): any[] => {
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

export function patchJournalAttributesValidator(): any {
  const validateActionOptions = (value: any) => {
    if (!value) return true;
    if (value !== "delete" && value !== "update") return false;
    return true;
  };
  return [
    checkSchema({
      "title.action": {
        errorMessage: "The value for action should be `delete` or `update`",
        custom: {
          options: validateActionOptions,
        },
      },
      "title.data": {
        errorMessage:
          "When performing update operation, the value for data should exist and be a non-empty string",
        custom: {
          options: (value, { req }) => {
            if (req.body.title.action === "update") {
              if (value && value.trim().length > 0) return true;
              return false;
            }
            if (req.body.title.action === "delete") return true;
            return false;
          },
        },
      },
      "description.action": {
        errorMessage: "The value for action should be `delete` or `update`",
        custom: {
          options: validateActionOptions,
        },
      },
      "description.data": {
        custom: {
          options: (value, { req }) => {
            if (req.body.description.action === "update") {
              if (value && value.trim().length > 0) return true;
              return false;
            }
            if (req.body.description.action === "delete") return true;
            return false;
          },
        },
      },
      "tags.action": {
        custom: {
          options: validateActionOptions,
        },
      },
      "tags.data": {
        custom: {
          options: (value, { req }) => {
            if (value && req.body.tags.action === "update") {
              if (!Array.isArray(value)) return false;
              if (value.length && value.length === 0) return false;
            }
            return true;
          },
        },
      },
      "photoUrl.action": {
        errorMessage: "The value for action should be `delete` or `update`",
        custom: {
          options: validateActionOptions,
        },
      },
      "photoUrl.data": {
        errorMessage:
          "The value for data should exist and be in a URL format, pointing to some resource. If you want to delete photoUrl data, use the `delete` action",
        custom: {
          options: (value, { req }) => {
            if (req.body.photoUrl.action === "update") {
              if (!value || value.trim().length === 0) return false;
              if (!isURLValid(value)) return false;
              return true;
            }
            return true;
          },
        },
      },
    }),
  ];
}
