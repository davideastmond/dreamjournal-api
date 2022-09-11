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
  dateOfBirth: Date;
  security: {
    twoFactorAuthentication: {
      enabled: boolean;
      userCtn: string | null;
      userCtnVerified: boolean;
      authCode: string | null;
      token: string | null;
      tokenCreatedAt: number | null;
      tokenExpiresAt: number | null;
      readableTokenDateData: {
        issued: string;
        expires: string;
      };
    };
  };
}
export type TSecureUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  journalIds: { [keyof: string]: Date };
  createdAt: Date;
  updatedAt: Date;
};

export interface IUserDocument extends IUser, Document {
  getAllJournals: () => Promise<IJournalDocument[]>;
  updateUserPassword: (plainTextPassword: string) => Promise<void>;
  updateFirstNameLastNameDob: (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string | Date;
  }) => Promise<IUserDocument>;
}
export interface IUserModel extends Model<IUserDocument> {
  createUniqueUser: ({
    email,
    firstName,
    lastName,
    dateOfBirth,
    plainTextPassword,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    plainTextPassword: string;
  }) => Promise<IUserDocument>;
}
