require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";

import { getJournalById } from "./middleware/get.journal";
import {
  mongooseJournalIdValidator,
  newJournalEntryValidator,
  patchJournalAttributesValidator,
} from "./middleware/journal.validators";
import { patchJournalAttributes } from "./middleware/patch.journal";
import { putNewJournalEntry } from "./middleware/put.journal";
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

// Create a new journal entry on a specific journal
router.put(
  "/:journalId/entry",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  newJournalEntryValidator(),
  validateRouteRequest,
  putNewJournalEntry
);

// Update a journal's attributes level
router.patch(
  "/:journalId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  patchJournalAttributesValidator(),
  validateRouteRequest,
  patchJournalAttributes
);

// Delete a specific journal by id - all
router.delete("/:journalId");

export default router;
