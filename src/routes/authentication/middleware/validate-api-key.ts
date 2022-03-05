require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { IS_PRODUCTION } from "../../../check-environment-variables";

const API_KEY = IS_PRODUCTION
  ? process.env.PRODUCTION_API_KEY
  : process.env.DEV_API_KEY;

export function validateAPIKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!API_KEY)
    throw new Error("API_KEY does not exist in environment variables");
  const authHeader = req.headers.authorization;
  const auth = authHeader && authHeader.split(" ")[1];
  if (auth && auth === API_KEY) {
    next();
  } else {
    return res.status(401).send({
      error: "Invalid or missing API key",
    });
  }
}
