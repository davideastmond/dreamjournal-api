import { JournalModel } from "../../models/journal/journal.schema";
import { IJournalDocument } from "../../models/journal/journal.types";
import { IUserDocument } from "../../models/user/user.types";

export async function getAllJournals(
  this: IUserDocument
): Promise<IJournalDocument[]> {
  if (this.journalIds) {
    const journalIds = Object.keys(this.journalIds);
    return JournalModel.findManyById(journalIds);
  } else {
    return [];
  }
}
