import { Document, Model } from "mongoose";
import { TSecureUser } from "../user/user.types";

export interface IJournal {
  title: string;
  ownerId: string;
  tags?: string[];
  photoUrl?: string;
  description?: string;
  journalEntryIds: { [keyof: string]: Date };
  createdAt: Date;
  updatedAt: Date;
}

export interface IJournalDocument extends IJournal, Document {
  patchJournalAttributes: ({
    title,
    tags,
    description,
    photoUrl,
  }: TJournalAttributesPatchPackageData) => Promise<TJournalAttributesReturnData>;
}

export type TNewJournalReturnData = {
  user: TSecureUser;
  journal: IJournalDocument;
};
export type TJournalAttributesPatchPackageData = {
  title?: TPatchData;
  tags?: TPatchData;
  description?: TPatchData;
  photoUrl?: TPatchData;
};

export type TUpdateAction = "update" | "delete";

export type TPatchData = {
  action?: TUpdateAction;
  data?: string | string[] | null;
};

export type TJournalFieldUpdateAction = {
  field: "title" | "tags" | "description" | "photoUrl" | "no changes";
  action: TUpdateAction;
};

export type TJournalAttributesReturnData = {
  actionsTaken: TJournalFieldUpdateAction[];
  journal: IJournalDocument | null;
};
export interface IJournalModel extends Model<IJournalDocument> {
  createJournalEntryForUserId: ({
    ownerId,
    title,
    description,
    tags,
    photoUrl,
  }: {
    ownerId: string;
    title: string;
    description?: string;
    photoUrl?: string;
    tags?: Array<string>;
  }) => Promise<TNewJournalReturnData>;
  findManyById: (arrayOfIds: string[]) => Promise<IJournalDocument[]>;
}
