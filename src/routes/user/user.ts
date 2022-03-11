require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";
import { createUserJournal } from "./middleware/user.journal.post";
import {
  getJournalsForUserId,
  getJournalById,
} from "./middleware/user.journals.get";
import {
  mongooseJournalIdValidator,
  mongooseUserIdValidator,
  newJournalValidator,
  restrictedAccessToSessionUserData,
} from "./middleware/user.validators";
const router = express.Router();

// Get all journals for a user
router.get(
  "/:userId/journals",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  validateRouteRequest,
  restrictedAccessToSessionUserData,
  getJournalsForUserId
);

// Get a specific journal
router.get(
  "/:userId/journals/:journalId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  mongooseJournalIdValidator(),
  validateRouteRequest,
  restrictedAccessToSessionUserData,
  getJournalById
);

// Create a new journal
router.post(
  "/:userId/journals",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  newJournalValidator(),
  validateRouteRequest,
  restrictedAccessToSessionUserData,
  createUserJournal
);

// Update a journal - at the journal attributes level
router.patch("/:userId/journals/:journalId");

// Delete a specific journal by id
router.delete("/:userId/journals/:journalId");

// Create a new journal entry on a specific journal
router.put("/:userId/journals/:journalId");

// Update a specific journal entry on a specific journal
router.patch("/:userId/journals/:journalId/:journalEntryId");

// Delete a specific journal entry on a specific journal
router.delete("/:userId/journals/:journalId/:journalEntryId");

export default router;
