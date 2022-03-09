import { IJournalEntry } from "../journalEntry/journal-entry.types";
import { Document, Model } from "mongoose";
export interface IJournal {
  title: string;
  ownerId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string;
  description: string;
  entries: { [keyof: string]: IJournalEntry };
}

export interface IJournalDocument extends IJournal, Document {}
export interface IJournalModel extends Model<IJournalDocument> {}
