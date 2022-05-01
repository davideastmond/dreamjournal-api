import { Schema } from "mongoose";
import { SchemaOptionsWithPojoToMixed } from "../definitions";
import { IJournalEntry } from "./journal-entry.types";

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    parentJournalId: { type: String, required: true },
    ownerId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    text: { type: String, required: true },
    photoUrl: { type: String, required: false },
    tags: { type: [String], required: false, default: [] },
    updatedAt: { type: Date },
    createdAt: { type: Date },
  },
  {
    // timestamps: true,
    strict: false,
    typePojoToMixed: false,
  } as SchemaOptionsWithPojoToMixed
);

export default journalEntrySchema;
