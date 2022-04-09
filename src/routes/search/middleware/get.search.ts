import { Request, Response } from "express";
import { QuerySearch } from "../../../search/search-utility";

export const doSearch = async (req: Request, res: Response) => {
  const { data } = req.query;
  const searchObject = new QuerySearch(data as string);
  const results = await searchObject.getResults();
  res.status(200).send(results);
};
