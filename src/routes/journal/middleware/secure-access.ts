import { NextFunction, Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";

export async function secureAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = res.locals.session._id;
  const { journalId } = req.params;
  if (!userId)
    return res
      .status(401)
      .send({ error: "Unauthorized request - invalid session" });

  const journal = await JournalModel.findById(journalId);
  if (!journal) {
    return res
      .status(400)
      .send({
        error:
          "Unauthorized request: there was an error in the data with this request",
      });
  }
  if (journal.ownerId === userId) {
    next();
  } else {
    return res
      .status(401)
      .send({
        error:
          "Unauthorized request - access to secure journal information is not allowed",
      });
  }
}
