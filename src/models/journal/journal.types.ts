import { Document, Model } from "mongoose";
import { TagAggregator } from "../../analytics/tags/tag-analytics";
import { IJournalEntry } from "../journalEntry/journal-entry.types";
import { TSecureUser } from "../user/user.types";

export interface IJournal {
  title: string;
  ownerId: string;
  tags?: string[];
  photoUrl?: string;
  description?: string;
  journalEntries: Array<IJournalEntry>;
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
  addNewEntry: ({
    title,
    description,
    text,
    photoUrl,
    tags,
  }: {
    title: string;
    description?: string;
    text: string;
    photoUrl?: string;
    tags: string[];
  }) => Promise<IJournalDocument>;
  deleteEntry: (
    journalEntryId: string
  ) => Promise<TJournalEntryDeleteResponseData>;
  patchJournalEntryAttributes: ({
    title,
    tags,
    description,
    photoUrl,
    text,
    journalEntryId,
  }: TJournalEntryAttributesPatchPackageData) => Promise<TJournalAttributesReturnData>;
  getTagAggregator: () => TagAggregator;
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
export type TJournalEntryAttributesPatchPackageData =
  TJournalAttributesPatchPackageData & {
    text: TPatchData;
    journalEntryId: string;
  };

export type TUpdateAction = "update" | "delete";

export type TPatchData = {
  action?: TUpdateAction;
  data?: string | string[] | null;
};

export type TJournalFieldUpdateAction = {
  field: "title" | "tags" | "description" | "photoUrl" | "text" | "no changes";
  action: TUpdateAction;
  data?: string | string[] | null;
};

export type TJournalAttributesReturnData = {
  actionsTaken: TJournalFieldUpdateAction[];
  journal: IJournalDocument | null;
};

export type TJournalEntryDeleteResponseData = {
  action: "delete";
  deletedJournalEntryId: string;
  journal: IJournalDocument;
};

export type TJournalDeleteResult = {
  info: {
    actionTaken: "delete" | "none";
    otherInfo?: string;
    deletedJournalId: string;
  };
  user: TSecureUser;
  journals: IJournalDocument[];
};

export interface IJournalModel extends Model<IJournalDocument> {
  createJournalForUserId: ({
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
  findByJournalIdAndDelete: ({
    journalId,
    requestorId,
  }: {
    journalId: string;
    requestorId: string;
  }) => Promise<TJournalDeleteResult>;
  countAllTags: (
    userId: string
  ) => Promise<{ tagCount: { [keyof: string]: number }; journalCount: number }>;
}
