require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";
import {
  deleteEntryFromJournal,
  deleteJournal,
} from "./middleware/delete.journal";

import { getJournalById } from "./middleware/get.journal";
import {
  mongooseJournalEntryIdValidator,
  mongooseJournalIdValidator,
  newJournalEntryValidator,
  patchJournalAttributesValidator,
} from "./middleware/journal.validators";
import { patchJournalAttributes } from "./middleware/patch.journal";
import { putNewJournalEntry } from "./middleware/put.journal";
import { secureAccess } from "./middleware/secure-access";
const router = express.Router();

// Get a specific journal - must exist on the user document
router.get(
  "/:journalId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  secureAccess,
  validateRouteRequest,
  getJournalById
);

// Create a new journal entry on a specific journal
router.put(
  "/:journalId/entry",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  secureAccess,
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
  secureAccess,
  patchJournalAttributesValidator(),
  validateRouteRequest,
  patchJournalAttributes
);

// Delete a specific journal by id - all
router.delete(
  "/:journalId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  secureAccess,
  validateRouteRequest,
  deleteJournal
);

router.delete(
  "/:journalId/entry/:journalEntryId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  mongooseJournalEntryIdValidator(),
  deleteEntryFromJournal
);

export default router;
