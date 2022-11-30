import { Request, Response } from "express";
import { JournalModel } from "../../../models/journal/journal.schema";
import { UserModel } from "../../../models/user/user.schema";

export const grabUserAdmin = async (req: Request, res: Response) => {
  // This is a sensitive process. It will return a raw user. Also, de-hash password
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    return res.status(200).send(user); // Send a raw user
  } catch (err: any) {
    return res.status(500).send({
      error: `Admin server error: ${JSON.stringify(err)}`,
    });
  }
};

export const grabJournalById = async (req: Request, res: Response) => {
  // Sensitive. Returns a journal using the ID
  try {
    const { journalId } = req.params;
    const journal = await JournalModel.findById(journalId);
    return res.status(200).send(journal);
  } catch (err: any) {
    return res.status(500).send({
      error: `Admin server error: ${JSON.stringify(err)}`,
    });
  }
};
