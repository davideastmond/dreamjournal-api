import {
  IJournalDocument,
  IJournalModel,
} from "../../models/journal/journal.types";

export async function findManyById(
  this: IJournalModel,
  arrayOfIds: string[]
): Promise<IJournalDocument[]> {
  return this.where({ "_id": { "$in": arrayOfIds } });
}
