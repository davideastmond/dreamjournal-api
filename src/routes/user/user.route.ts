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
import { getAllJournalTagCountAnalytics } from "./middleware/user.journals.tags.analytics.get";
import {
  updateFirstNameLastName,
  updatePasswordMiddleware,
} from "./middleware/user.patch";
import {
  mongooseUserIdValidator,
  newJournalValidator,
  restrictedAccessToSessionUserData,
  userBasicProfileUpdateValidator,
  userPasswordUpdateValidator,
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
  restrictedAccessToSessionUserData,
  validateRouteRequest,
  getJournalsForUserId
);

// Do tag analytics for all journals for user
router.get(
  "/:userId/journals/tags/analytics",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  restrictedAccessToSessionUserData,
  validateRouteRequest,
  getAllJournalTagCountAnalytics
  // POIJ
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

router.patch(
  "/:userId/profile/secure",
  validateAPIKey,
  mongooseUserIdValidator(),
  userPasswordUpdateValidator(),
  validateRouteRequest,
  updatePasswordMiddleware
);

router.patch(
  "/:userId/profile/basic",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  userBasicProfileUpdateValidator(),
  validateRouteRequest,
  updateFirstNameLastName
);

export default router;
