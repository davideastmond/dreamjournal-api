require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";

import { getJournalById } from "./middleware/get.journal";
import { mongooseJournalIdValidator } from "./middleware/journal.validators";
const router = express.Router();

// Get a specific journal - must exist on the user document
router.get(
  "/:journalId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  validateRouteRequest,
  getJournalById
);

// Update a journal - at the journal attributes level
router.patch("/:journalId");

// Delete a specific journal by id
router.delete("/:userId/journals/:journalId");

export default router;
