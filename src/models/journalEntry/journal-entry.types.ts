import { Document, Model } from "mongoose";
export interface IJournalEntry {
  parentJournalId: string;
  ownerId: string;
  title: string;
  description?: string;
  text: string;
  photoUrl?: string;
  attributes?: {
    lucid?: boolean;
  };
  tags: string[];
  entryDate?: Date; // User should be able to manually enter this
  // These are automatic timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJournalEntryDocument extends IJournalEntry, Document {}
export interface IJournalEntryModel extends Model<IJournalEntryDocument> {}
