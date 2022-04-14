import { countTags, TagAggregator } from "../../analytics/tags/tag-analytics";
import {
  IJournalDocument,
  IJournalModel,
} from "../../models/journal/journal.types";

export function getTagAggregator(this: IJournalDocument): TagAggregator {
  return new TagAggregator(this);
}

export async function countAllTags(
  this: IJournalModel,
  userId: string
): Promise<{ tagCount: { [keyof: string]: number }; journalCount: number }> {
  const journals = await this.find({ "ownerId": userId });
  if (!journals || journals.length === 0)
    throw new Error(`No journals found for userId ${userId}`);

  const tags = extractAllTags(journals);

  return { tagCount: countTags(tags), journalCount: journals.length };
}

function extractAllTags(journals: IJournalDocument[]): string[] {
  let tags: string[] = [];
  for (let journal of journals) {
    const extractedTags = journal.getTagAggregator().tags;
    tags = [...tags, ...extractedTags];
  }
  return tags;
}
