import { Document, Model } from "mongoose";
import { IJournalDocument } from "../journal/journal.types";

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  hashedPassword: string;
  journalIds: { [keyof: string]: Date };
  jwToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TSecureUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  journalIds: { [keyof: string]: Date };
  createdAt: Date;
  updatedAt: Date;
};

export interface IUserDocument extends IUser, Document {
  getAllJournals: () => Promise<IJournalDocument[]>;
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
