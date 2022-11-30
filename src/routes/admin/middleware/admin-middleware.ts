require("dotenv").config();
import { IS_PRODUCTION } from "../../../check-environment-variables";

import { NextFunction, Request, Response } from "express";

const ADMIN_PASSWORD = IS_PRODUCTION
  ? process.env.PRODUCTION_ADMIN_PWD
  : process.env.DEV_ADMIN_PWD;

export const validateAdminPwd = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Grab the custom header from the request
  // We'll use header ADMIN_PWD
  const adminPassword = req.headers["admin_pwd"];
  if (!adminPassword) return res.status(400).send("Invalid admin request");
  // Determine if we're in production or dev mode
  if (adminPassword === ADMIN_PASSWORD) {
    next();
  } else {
    return res.status(401).send("Admin: not authorized");
  }
};
