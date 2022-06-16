import { Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";
export async function getAllJournalTagCountAnalytics(
  req: Request,
  res: Response
) {
  const { userId } = req.params;

  try {
    const data = await JournalModel.countAllTags(userId);
    return res
      .status(200)
      .send({ tagCount: data.tagCount, journalCount: data.journalCount });
  } catch (exception) {
    if (exception.message.includes("No journals found for userId")) {
      return res.status(404).send({ error: exception.message });
    }
    return res.status(500).send({ error: exception.message });
  }
}
