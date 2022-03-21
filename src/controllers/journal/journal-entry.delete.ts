import {
  IJournalDocument,
  TJournalEntryDeleteResponseData,
} from "../../models/journal/journal.types";
import { IJournalEntryDocument } from "../../models/journalEntry/journal-entry.types";

export async function deleteEntry(
  this: IJournalDocument,
  journalEntryId: string
): Promise<TJournalEntryDeleteResponseData> {
  const exists = this.journalEntries.some((entry: IJournalEntryDocument) => {
    return entry._id.toString() === journalEntryId;
  });
  if (!exists)
    throw new Error(`404 Journal entry with id ${journalEntryId} is not found`);

  const entries = this.journalEntries.filter((entry: IJournalEntryDocument) => {
    return entry._id.toString() !== journalEntryId;
  });

  this.journalEntries = entries;
  this.markModified("journalEntries");
  await this.save();
  return {
    journal: this,
    action: "delete",
    deletedJournalEntryId: journalEntryId,
  };
}
