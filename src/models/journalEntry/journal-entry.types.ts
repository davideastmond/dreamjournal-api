import { Document, Model } from "mongoose";
export interface IJournalEntry {
  parentJournalId: string;
  ownerId: string;
  title: string;
  description?: string;
  text: string;
  photoUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IJournalEntryDocument extends IJournalEntry, Document {}
export interface IJournalEntryModel extends Model<IJournalEntryDocument> {}
