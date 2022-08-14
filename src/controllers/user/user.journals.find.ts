import { JournalModel } from "../../models/journal/journal.schema";
import { IJournalDocument } from "../../models/journal/journal.types";
import { IUserDocument } from "../../models/user/user.types";

export async function getAllJournals(
  this: IUserDocument
): Promise<IJournalDocument[]> {
  if (this.journalIds) {
    const journalIds = Object.keys(this.journalIds);
    const foundJournals = await JournalModel.findManyById(journalIds);

    if (journalIds.length !== foundJournals.length) {
      console.warn(
        `journal count for user ${this._id.toString()} is ${
          journalIds.length
        } | document count is ${foundJournals.length}.`
      );
      const res = getJournalIndexes({ foundJournals, userDocument: this });
      this.journalIds = res;
      this.markModified("journalIds");
      await this.save();
    }
    return foundJournals;
  } else {
    return [];
  }
}

type TReconciledJournalIndex = {
  [keyof: string]: Date;
};
export function getJournalIndexes(data: {
  foundJournals: IJournalDocument[];
  userDocument: IUserDocument;
}): TReconciledJournalIndex {
  const updatedJournalIndex: any = {};
  console.log(data.foundJournals);
  data.foundJournals.forEach((journal) => {
    if (journal.ownerId.toString() === data.userDocument._id.toString()) {
      updatedJournalIndex[journal._id.toString()] = journal.createdAt;
    }
  });
  return updatedJournalIndex;
}
