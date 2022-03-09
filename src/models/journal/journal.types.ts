import { IJournalEntry } from "../journalEntry/journal-entry.types";
import { Document, Model } from "mongoose";
import { TNewJournalReturnData } from "../user/user.types";
export interface IJournal {
  title: string;
  ownerId: string;
  tags?: string[];
  photoUrl?: string;
  description?: string;
  entries: { [keyof: string]: IJournalEntry };
  createdAt: Date;
  updatedAt: Date;
}

export interface IJournalDocument extends IJournal, Document {}
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
}
