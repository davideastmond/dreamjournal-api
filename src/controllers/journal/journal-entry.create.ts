import { IJournalDocument } from "../../models/journal/journal.types";

export async function addNewEntry(
  this: IJournalDocument,
  {
    title,
    description,
    text,
    photoUrl,
    tags,
    entryDate,
    lucid,
  }: {
    title: string;
    description?: string;
    text: string;
    photoUrl?: string;
    tags: string[];
    entryDate?: Date;
    lucid?: boolean;
  }
): Promise<IJournalDocument> {
  const entry = {
    attributes: {
      lucid: !!lucid,
    },
    parentJournalId: this._id.toString(),
    ownerId: this.ownerId,
    title,
    description,
    text,
    photoUrl,
    tags,
    entryDate,
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  this.journalEntries.push(entry);
  await this.save();
  return this;
}
