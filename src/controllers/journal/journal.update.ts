import {
  IJournalDocument,
  TJournalAttributesPatchPackageData,
  TJournalAttributesReturnData,
  TJournalFieldUpdateAction,
} from "../../models/journal/journal.types";

export async function patchJournalAttributes(
  this: IJournalDocument,
  { title, tags, description, photoUrl }: TJournalAttributesPatchPackageData
): Promise<TJournalAttributesReturnData> {
  const changes: TJournalFieldUpdateAction[] = [];

  if (title) {
    if (title.action === "update") {
      this.title = title.data as string;
      changes.push({
        field: "title",
        action: title.action,
      });
    } else {
      throw new Error(
        "Can't delete a journal title. This field must be a non-empty string"
      );
    }
  }

  if (tags) {
    if (tags.action === "update") {
      this.tags = tags.data as string[];
      changes.push({
        field: "tags",
        action: tags.action,
      });
    } else if (tags.action === "delete") {
      this.tags = [];
      changes.push({
        field: "tags",
        action: tags.action,
      });
    }
  }

  if (description) {
    if (description.action === "update") {
      this.description = description.data as string;
      changes.push({
        field: "description",
        action: description.action,
      });
    } else if (description.action === "delete") {
      this.description = "";
      changes.push({
        field: "description",
        action: tags.action,
      });
    }
  }

  if (photoUrl) {
    if (photoUrl.action === "update") {
      this.photoUrl = photoUrl.data as string;
      changes.push({
        field: "photoUrl",
        action: tags.action,
      });
    } else if (photoUrl.action === "delete") {
      this.photoUrl = "";
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
