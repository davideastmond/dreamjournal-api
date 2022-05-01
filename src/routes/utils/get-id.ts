import { Response } from "express";
export function getUserId(ResponseObject: Response): string | null {
  const { _id } = ResponseObject.locals.session;
  return _id ?? null;
}
