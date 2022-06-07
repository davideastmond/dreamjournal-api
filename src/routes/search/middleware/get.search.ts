import { Request, Response } from "express";
import { QuerySearch } from "../../../search/search-utility";

export const doSearch = async (req: Request, res: Response) => {
  const { data } = req.query;
  const userId = res.locals.session._id;

  const searchObject = new QuerySearch(data as string, userId as string);
  const results = await searchObject.getResults();
  res.status(200).send(results);
};
