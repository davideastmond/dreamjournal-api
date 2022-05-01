import { IJournalDocument } from "../../models/journal/journal.types";

export class TagAggregator {
  private readonly aggregation: { [keyof: string]: number } = {};
  private document: IJournalDocument;
  private _tags: string[] = [];

  constructor(document: IJournalDocument) {
    this.document = document;
    this.getAllTags();
    this.aggregation = countTags(this._tags);
  }

  public get tags() {
    return this._tags;
  }

  public getAggregation() {
    return this.aggregation;
  }

  private getAllTags(): void {
    let allTags: string[] = [];
    if (this.document.tags && this.document.tags.length > 0) {
      allTags = [...allTags, ...this.document.tags];
    }

    this.document.journalEntries.forEach((journalEntry) => {
      if (journalEntry.tags && journalEntry.tags.length > 0) {
        allTags = [...allTags, ...journalEntry.tags];
      }
    });
    this._tags = allTags.map((tag) => tag.toLowerCase());
  }
}

export function countTags(_tags: string[]): { [keyof: string]: number } {
  const aggregation: { [keyof: string]: number } = {};

  _tags.forEach((tag) => {
    if (aggregation[`${tag}`] === undefined) {
      aggregation[`${tag}`] = 1;
    } else {
      aggregation[`${tag}`]++;
    }
  });
  return aggregation;
}
