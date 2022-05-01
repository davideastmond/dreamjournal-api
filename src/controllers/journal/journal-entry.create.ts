import { IJournalDocument } from "../../models/journal/journal.types";

export async function addNewEntry(
  this: IJournalDocument,
  {
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
  }
): Promise<IJournalDocument> {
  const entry = {
    parentJournalId: this._id.toString(),
    ownerId: this.ownerId,
    title,
    description,
    text,
    photoUrl,
    tags,
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  this.journalEntries.push(entry);
  await this.save();
  return this;
}
