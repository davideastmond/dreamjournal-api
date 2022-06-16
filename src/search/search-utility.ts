import { JournalModel } from "../models/journal/journal.schema";
import { IJournalDocument } from "../models/journal/journal.types";
import { IJournalEntry } from "../models/journalEntry/journal-entry.types";
import {
  MatchingCriteria,
  TJournalEntryMatchResult,
  TJournalMatchResult,
  TSearchResults,
} from "./search.types";

export class QuerySearch {
  private readonly queryString: string;
  private results: TSearchResults;
  private readonly userId: string;
  private nonIndexedResults: boolean;
  constructor(queryString: string, forUserId: string) {
    this.queryString = queryString;
    this.userId = forUserId;
    this.results = {
      queryString: queryString,
      journalEntries: [],
      journals: [],
    };
  }

  public async getResults() {
    await this.getJournalMatches();
    if (!this.nonIndexedResults) {
      return this.results;
    }
    return { ...this.results, otherInfo: "non-index result" };
  }

  private async getJournalMatches() {
    const tagMatches = await this.getJournalTagMatches();
    const indexedMatches = await this.getIndexedJournalMatches();
    const entryQueries =
      this.getJournalEntriesFromJournalMatchResults(indexedMatches);

    let journalEntryQueryResults;
    if (entryQueries.length > 0) {
      journalEntryQueryResults = this.queryJournalEntries(entryQueries);
    } else {
      journalEntryQueryResults = await this.getFallBackJournalEntryMatches();
    }
    this.results.journals = [...tagMatches, ...indexedMatches];
    this.results.journalEntries = journalEntryQueryResults;
  }

  private async getIndexedJournalMatches(): Promise<
    Array<TJournalMatchResult>
  > {
    const query = { "$search": this.queryString };
    try {
      const results = await JournalModel.find({
        "$text": query,
        ownerId: this.userId,
      });

      if (results && results.length && results.length > 0) {
        return results.map((result: IJournalDocument) => {
          return {
            journal: result,
            matchedBy: result.title
              .toLowerCase()
              .includes(this.queryString.toLowerCase())
              ? MatchingCriteria.JournalTitle
              : result.description
                  .toLowerCase()
                  .includes(this.queryString.toLowerCase())
              ? MatchingCriteria.JournalDescription
              : MatchingCriteria.Default,
          };
        });
      }
    } catch (exception) {
      this.nonIndexedResults = true;
      return [];
    }
    return [];
  }

  private async getJournalTagMatches(): Promise<Array<TJournalMatchResult>> {
    const query = { "tags": { "$in": this.queryString } };
    const results = await JournalModel.find(query);

    if (results && results.length && results.length > 0) {
      return results.map((result) => {
        return {
          journal: result,
          matchedBy: MatchingCriteria.JournalTags,
        };
      });
    }
    return [];
  }

  private getJournalEntriesFromJournalMatchResults(
    results: TJournalMatchResult[]
  ): IJournalEntry[] {
    const entries: IJournalEntry[] = [];
    for (let journalMatch of results) {
      for (let e of journalMatch.journal.journalEntries) {
        entries.push(e);
      }
    }
    return entries;
  }

  private async getFallBackJournalEntryMatches() {
    const journals = await JournalModel.find({
      ownerId: this.userId,
    });
    if (!journals || journals.length === 0) return [];
    const entries = this.getEntriesFromArrayOfJournals(journals);
    return this.queryJournalEntries(entries);
  }

  private getEntriesFromArrayOfJournals(
    journals: IJournalDocument[]
  ): IJournalEntry[] {
    const entries: IJournalEntry[] = [];
    for (let journal of journals) {
      for (let journalEntry of journal.journalEntries) {
        if (journalEntry) entries.push(journalEntry);
      }
    }
    return entries;
  }
  private queryJournalEntries(
    entries: IJournalEntry[]
  ): TJournalEntryMatchResult[] {
    const matches: TJournalEntryMatchResult[] = [];

    const expr = new RegExp(`${this.queryString}`, "mi");
    for (let entry of entries) {
      if (expr.test(entry.title)) {
        matches.push({
          journalEntry: entry,
          matchedBy: MatchingCriteria.JournalEntryTitle,
        });
      }
      if (expr.test(entry.description)) {
        matches.push({
          journalEntry: entry,
          matchedBy: MatchingCriteria.JournalEntryDescription,
        });
      }
      if (expr.test(entry.text)) {
        matches.push({
          journalEntry: entry,
          matchedBy: MatchingCriteria.JournalEntryText,
        });
      }

      if (entry.tags && entry.tags.length > 0) {
        const joinedTags = entry.tags.join(" ");
        if (expr.test(joinedTags)) {
          matches.push({
            journalEntry: entry,
            matchedBy: MatchingCriteria.JournalEntryTags,
          });
        }
      }
    }
    return matches;
  }
}
