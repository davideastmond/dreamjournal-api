require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";
import {
  checkIfSessionUser,
  getSecureUserProfile,
} from "./middleware/get.user";
import { createUserJournal } from "./middleware/user.journal.post";
import { getJournalsForUserId } from "./middleware/user.journals.get";
import {
  mongooseUserIdValidator,
  newJournalValidator,
  restrictedAccessToSessionUserData,
} from "./middleware/user.validators";
const router = express.Router();

// Get user info
router.get(
  "/:userId",
  validateAPIKey,
  jwtVerifyMiddleWare,
  checkIfSessionUser,
  mongooseUserIdValidator(),
  validateRouteRequest,
  getSecureUserProfile
);

// Get all journals for a user
router.get(
  "/:userId/journals",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  validateRouteRequest,
  getJournalsForUserId
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

// Update a specific journal entry on a specific journal
router.patch("/:userId/journals/:journalId/:journalEntryId");

// Delete a specific journal entry on a specific journal
router.delete("/:userId/journals/:journalId/:journalEntryId");

export default router;
