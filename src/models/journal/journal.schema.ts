import { Schema, model } from "mongoose";
import {
  countAllTags,
  getTagAggregator,
} from "../../controllers/journal/journal-analytics";
import { addNewEntry } from "../../controllers/journal/journal-entry.create";
import { deleteEntry } from "../../controllers/journal/journal-entry.delete";
import { patchJournalEntryAttributes } from "../../controllers/journal/journal-entry.update";
import { createJournalForUserId } from "../../controllers/journal/journal.create";
import { findByJournalIdAndDelete } from "../../controllers/journal/journal.delete";
import { findManyById } from "../../controllers/journal/journal.find";
import { patchJournalAttributes } from "../../controllers/journal/journal.update";
import { SchemaOptionsWithPojoToMixed } from "../definitions";
import journalEntrySchema from "../journalEntry/journal-entry.schema";
import { IJournal, IJournalDocument, IJournalModel } from "./journal.types";

const journalSchema = new Schema<IJournal>(
  {
    title: { type: String, required: true, default: "New Journal" },
    ownerId: { type: String, required: true },
    tags: { type: [String], required: false, default: [] },
    photoUrl: { type: String, required: false },
    description: { type: String, required: false },
    journalEntries: {
      type: [journalEntrySchema],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
    typePojoToMixed: false,
  } as SchemaOptionsWithPojoToMixed
);
journalSchema.index({
  title: "text",
  description: "text",
  "journalEntries.title": "text",
  "journalEntries.description": "text",
  "journalEntries.text": "text",
  "journalEntries.tags": "text",
});

journalSchema.methods.patchJournalAttributes = patchJournalAttributes;
journalSchema.methods.addNewEntry = addNewEntry;
journalSchema.methods.deleteEntry = deleteEntry;
journalSchema.methods.patchJournalEntryAttributes = patchJournalEntryAttributes;
journalSchema.methods.getTagAggregator = getTagAggregator;

journalSchema.statics.createJournalForUserId = createJournalForUserId;

journalSchema.statics.findManyById = findManyById;
journalSchema.statics.findByJournalIdAndDelete = findByJournalIdAndDelete;
journalSchema.statics.countAllTags = countAllTags;

export default journalSchema;

export const JournalModel = model<IJournalDocument, IJournalModel>(
  "journal",
  journalSchema
);
