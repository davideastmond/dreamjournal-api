import { Document, Model } from "mongoose";

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  hashedPassword: string;
  journalIds: { [keyof: string]: Date };
  jwToken: string;
}

export interface IUserDocument extends IUser, Document {}
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
