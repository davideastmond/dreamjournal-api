import { Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";
import { UserModel } from "../../../models/user/user.schema";
export async function getJournalById(req: Request, res: Response) {
  const { journalId } = req.params;
  const userId = res.locals.session._id;
  if (!userId)
    return res
      .status(401)
      .send({ error: "Unauthorized request or unknown session" });

  try {
    const user = await UserModel.findById(userId);
    if (user) {
      if (user.journalIds[journalId]) {
        const journal = await JournalModel.findById(journalId);
        if (journal) return res.status(200).send(journal);
      } else {
        return res
          .status(404)
          .send({ error: `Cannot find journal by journalId ${journalId}` });
      }
    } else {
      return res
        .status(401)
        .send({ error: "Unauthorized request or unknown session" });
    }
  } catch (exception: any) {
    console.error("Exception " + exception);
    return res.status(500).send({ error: `${exception.message}` });
  }
}
