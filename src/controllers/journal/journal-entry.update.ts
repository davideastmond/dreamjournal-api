import { JournalModel } from "../../models/journal/journal.schema";
import {
  TJournalEntryAttributesPatchPackageData,
  TJournalFieldUpdateAction,
  TJournalAttributesReturnData,
} from "../../models/journal/journal.types";

export async function patchJournalEntryAttributes({
  title,
  tags,
  description,
  photoUrl,
  text,
  journalEntryId,
}: TJournalEntryAttributesPatchPackageData): Promise<TJournalAttributesReturnData> {
  const changes: TJournalFieldUpdateAction[] = [];
  if (title && title.action) {
    if (title.action === "update") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        {
          $set: {
            "journalEntries.$.title": title.data as string,
            updatedAt: new Date(),
          },
        }
      );
      changes.push({
        field: "title",
        action: title.action,
        data: title.data,
      });
    } else {
      throw new Error(
        "Can't delete a journal entry title. This field must be a non-empty string"
      );
    }
  }

  if (tags && tags.action) {
    if (tags.action === "update") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        {
          $set: {
            "journalEntries.$.tags": tags.data as string[],
            updatedAt: new Date(),
          },
        }
      );
      changes.push({
        field: "tags",
        action: tags.action,
        data: tags.data,
      });
    } else if (tags.action === "delete") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        { $set: { "journalEntries.$.tags": [], updatedAt: new Date() } }
      );
      changes.push({
        field: "tags",
        action: tags.action,
      });
    }
  }

  if (text && text.action) {
    if (text.action === "update") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        {
          $set: {
            "journalEntries.$.text": text.data as string,
            updatedAt: new Date(),
          },
        }
      );
      changes.push({
        field: "text",
        action: text.action,
        data: text.data,
      });
    } else if (text.action === "delete") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        { $set: { "journalEntries.$.text": "", updatedAt: new Date() } }
      );
      changes.push({
        field: "text",
        action: text.action,
      });
    }
  }

  if (description && description.action) {
    if (description.action === "update") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        {
          $set: {
            "journalEntries.$.description": description.data as string,
            updatedAt: new Date(),
          },
        }
      );
      changes.push({
        field: "description",
        action: description.action,
        data: description.data,
      });
    }
  } else if (description && description.action === "delete") {
    await JournalModel.updateOne(
      { "journalEntries._id": journalEntryId },
      { $set: { "journalEntries.$.description": "", updatedAt: new Date() } }
    );
    changes.push({
      field: "description",
      action: description.action,
    });
  }

  if (photoUrl && photoUrl.action) {
    if (photoUrl.action === "update") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        { $set: { "journalEntries.$.photoUrl": "", updatedAt: new Date() } }
      );
      changes.push({
        field: "photoUrl",
        action: photoUrl.action,
        data: photoUrl.data,
      });
    } else if (photoUrl.action === "delete") {
      await JournalModel.updateOne(
        { "journalEntries._id": journalEntryId },
        { $set: { "journalEntries.$.photoUrl": "", updatedAt: new Date() } }
      );
      changes.push({
        field: "photoUrl",
        action: photoUrl.action,
      });
    }
  }

  if (changes.length === 0) {
    changes.push({
      field: "no changes",
      action: null,
    });
    return {
      actionsTaken: changes,
      journal: null,
    };
  }

  await this.save();
  return {
    actionsTaken: changes,
    journal: this,
  };
}
