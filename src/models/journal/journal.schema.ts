import { Schema, model } from "mongoose";
import { SchemaOptionsWithPojoToMixed } from "../definitions";
import { IJournal, IJournalDocument, IJournalModel } from "./journal.types";

const journalSchema = new Schema<IJournal>(
  {
    title: { type: String, required: true, default: "New Journal" },
    ownerId: { type: String, required: true },
    tags: { type: [String], required: false, default: [] },
    photoUrl: { type: String, required: false },
    description: { type: String, required: false },
    entries: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  {
    timestamps: true,
    strict: false,
    typePojoToMixed: false,
  } as SchemaOptionsWithPojoToMixed
);

export default journalSchema;
export const JournalModel = model<IJournalDocument, IJournalModel>(
  "journal",
  journalSchema
);
