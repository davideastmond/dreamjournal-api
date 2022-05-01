import { IJournalDocument } from "../models/journal/journal.types";
import { IJournalEntry } from "../models/journalEntry/journal-entry.types";

export type TSearchResults = {
  queryString: string;
  journals: Array<TJournalMatchResult>;
  journalEntries: Array<TJournalEntryMatchResult>;
};

export type TJournalMatchResult = {
  journal: IJournalDocument;
  matchedBy: MatchingCriteria;
};

export type TJournalEntryMatchResult = {
  journalEntry: IJournalEntry;
  matchedBy: MatchingCriteria;
};

export enum MatchingCriteria {
  JournalTitle = "journalTitle",
  JournalDescription = "journalDescription",
  JournalTags = "journalTags",
  JournalCreateDate = "journalCreateDate",
  JournalUpdatedDate = "journalUpdatedDate",

  JournalEntryTitle = "journalEntryTitle",
  JournalEntryDescription = "journalEntryDescription",
  JournalEntryTags = "journalEntryTags",
  JournalEntryText = "journalEntryText",
  journalEntryCreateDate = "journalEntryCreateDate",
  JournalEntryUpdatedDate = "journalEntryUpdatedDate",

  Default = "default",
}
