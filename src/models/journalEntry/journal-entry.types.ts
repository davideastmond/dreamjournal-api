import { Document, Model } from "mongoose";
export interface IJournalEntry {
  title: string;
  description: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string;
  tags: string[];
}

export interface IJournalEntryDocument extends IJournalEntry, Document {}
export interface IJournalEntryModel extends Model<IJournalEntryDocument> {}
