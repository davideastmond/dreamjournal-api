import { Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";
export async function putNewJournalEntry(req: Request, res: Response) {
  const { journalId } = req.params;
  const { title, description, text, photoUrl, tags } = req.body;
  try {
    const journal = await JournalModel.findById(journalId);
    if (journal) {
      const refreshedJournal = await journal.addNewEntry({
        title,
        description,
        text,
        photoUrl,
        tags,
      });
      return res.status(200).send(refreshedJournal);
    } else {
      return res
        .status(404)
        .send({ error: `journal with id ${journalId} not found` });
    }
  } catch (exception) {
    return res.status(500).send({ error: exception.message });
  }
}
