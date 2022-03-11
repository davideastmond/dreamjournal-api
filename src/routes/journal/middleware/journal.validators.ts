import { param } from "express-validator";
import mongoose from "mongoose";

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
