import { Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";
export async function patchJournalAttributes(req: Request, res: Response) {
  const { title, description, tags, photoUrl } = req.body;
  const { journalId } = req.params;

  try {
    const targetJournal = await JournalModel.findById(journalId);
    if (!targetJournal)
      return res
        .status(404)
        .send({ error: `Journal with id ${journalId} not found` });

    const patchData = await targetJournal.patchJournalAttributes({
      title,
      description,
      tags,
      photoUrl,
    });
    return res.status(200).send(patchData);
  } catch (exception) {
    return res.status(500).send({ error: exception.message });
  }
}
