import { Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";
import { getUserId } from "../../utils/get-id";

export async function createUserJournal(req: Request, res: Response) {
  try {
    const _id = getUserId(res);
    const { title, description, photoUrl, tags } = req.body;
    const journalData = await JournalModel.createJournalForUserId({
      ownerId: _id,
      title,
      description,
      photoUrl,
      tags,
    });
    return res.status(201).send(journalData);
  } catch (exception: any) {
    return res.status(500).send({ error: exception.message });
  }
}
