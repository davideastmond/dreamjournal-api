require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";
import {
  deleteEntryFromJournal,
  deleteJournal,
} from "./middleware/delete.journal";

import { getJournalById, sendTagAnalytics } from "./middleware/get.journal";
import {
  mongooseJournalEntryIdValidator,
  mongooseJournalIdValidator,
  newJournalEntryValidator,
  patchJournalAttributesValidator,
} from "./middleware/journal.validators";
import {
  patchJournalAttributes,
  routePatchJournalEntryAttributes,
} from "./middleware/patch.journal";
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

router.get(
  "/:journalId/tags/analytics",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  secureAccess,
  validateRouteRequest,
  sendTagAnalytics
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

// Delete a journal entry
router.delete(
  "/:journalId/entry/:journalEntryId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  mongooseJournalEntryIdValidator(),
  validateRouteRequest,
  deleteEntryFromJournal
);

router.patch(
  "/:journalId/entry/:journalEntryId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseJournalIdValidator(),
  mongooseJournalEntryIdValidator(),
  secureAccess,
  patchJournalAttributesValidator(),
  validateRouteRequest,
  routePatchJournalEntryAttributes
);

export default router;
