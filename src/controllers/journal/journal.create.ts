import { IJournalModel } from "../../models/journal/journal.types";
import { UserModel } from "../../models/user/user.schema";
import { TNewJournalReturnData } from "../../models/user/user.types";

export async function createJournalEntryForUserId(
  this: IJournalModel,
  {
    ownerId,
    title,
    description,
    tags,
    photoUrl,
  }: {
    ownerId: string;
    title: string;
    description?: string;
    photoUrl?: string;
    tags?: Array<string>;
  }
): Promise<TNewJournalReturnData> {
  const user = await UserModel.findById(ownerId);
  if (user) {
    const journalPackage = {
      ownerId: user._id.toString(),
      title,
      description,
      photoUrl,
      tags: tags ?? [],
    };
    const newJournal = await this.create(journalPackage);

    user.journalIds[`${newJournal._id.toString()}`] = new Date();
    user.markModified("journalIds");
    await user.save();
    return {
      user,
      journal: newJournal,
    };
  } else {
    throw new Error(`user with id ${ownerId} not found`);
  }
}
