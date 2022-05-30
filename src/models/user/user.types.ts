import { Document, Model } from "mongoose";
import { IJournalDocument } from "../journal/journal.types";
import { TSecurityQuestionTemplate } from "./user.security.data";

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  hashedPassword: string;
  journalIds: { [keyof: string]: Date };
  jwToken: string;
  createdAt: Date;
  updatedAt: Date;
  security: {
    isSet: boolean;
    recoveryQuestions: Array<TSecurityQuestion>;
  };
}

export type TSecurityQuestion = {
  question: TSecurityQuestionTemplate;
  answer: string;
};
export type TSecureUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  journalIds: { [keyof: string]: Date };
  createdAt: Date;
  updatedAt: Date;
};

export type TNewSecurityQuestionDataSubmission = {
  [keyof in "q0" | "q1" | "q2"]: {
    selectedQuestionId: string;
    selectedQuestionPrompt: string;
    response: string;
  };
};

export interface IUserDocument extends IUser, Document {
  getAllJournals: () => Promise<IJournalDocument[]>;
  updateUserPassword: (plainTextPassword: string) => Promise<void>;
  updateFirstNameLastName: (data: {
    firstName: string;
    lastName: string;
  }) => Promise<IUserDocument>;
}
export interface IUserModel extends Model<IUserDocument> {
  createUniqueUser: ({
    email,
    firstName,
    lastName,
    plainTextPassword,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    plainTextPassword: string;
  }) => Promise<IUserDocument>;
}
