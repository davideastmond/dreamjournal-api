import {
  IJournalModel,
  TJournalDeleteResult,
} from "../../models/journal/journal.types";
import { UserModel } from "../../models/user/user.schema";
import { convertToSecureUser } from "../user/utils";

export async function findByJournalIdAndDelete(
  this: IJournalModel,
  { journalId, requestorId }: { journalId: string; requestorId: string }
): Promise<TJournalDeleteResult> {
  const targetJournal = await this.find({
    "_id": journalId,
    ownerId: requestorId,
  });
  const user = await UserModel.findById(requestorId);
  let otherInfo = "Action was successfully completed";
  let sumActions = 0;

  if (!user && targetJournal.length === 0) {
    throw new Error(`User and the journal cannot be found`);
  }

  if (user.journalIds[`${journalId}`]) {
    delete user.journalIds[`${journalId}`];
    user.markModified("journalIds");
    await user.save();
    sumActions++;
  } else {
    otherInfo = "id was not found on the user document";
  }

  let refreshedJournalsForUser;
  let secureUser;

  if (targetJournal && targetJournal[0]) {
    await targetJournal[0].delete();
    refreshedJournalsForUser = await this.find({ ownerId: requestorId });
    secureUser = convertToSecureUser(user);
    sumActions++;
  } else {
    otherInfo = otherInfo.concat(" journal wasn't found in the collection");
  }

  return {
    info: {
      actionTaken: sumActions > 0 ? "delete" : "none",
      deletedJournalId: journalId,
      otherInfo,
    },
    user: secureUser,
    journals: refreshedJournalsForUser,
  };
}
