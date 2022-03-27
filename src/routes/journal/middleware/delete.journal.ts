import { Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";

export async function deleteEntryFromJournal(req: Request, res: Response) {
  const { journalId, journalEntryId } = req.params;

  try {
    const journal = await JournalModel.findById(journalId);
    if (journal) {
      const refreshedJournal = await journal.deleteEntry(journalEntryId);
      return res.status(200).send(refreshedJournal);
    } else {
      return res
        .status(404)
        .send({ error: `Journal with id ${journalId} not found` });
    }
  } catch (exception: any) {
    if (exception.message.includes("404")) {
      return res.status(404).send({ error: exception.message });
    } else {
      return res.status(500).send({
        error: "This operation cannot be completed due to a server error",
      });
    }
  }
}

export async function deleteJournal(req: Request, res: Response) {
  const { journalId } = req.params;
  const userId = res.locals.session._id;
  try {
    const result = await JournalModel.findByJournalIdAndDelete({
      requestorId: userId,
      journalId,
    });
    return res.status(200).send(result);
  } catch (exception: any) {
    return res.status(500).send({
      error: "This operation cannot be completed due to a server error",
    });
  }
}
