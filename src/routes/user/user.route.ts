require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";
import {
  checkIfSessionUser,
  getSecureUserProfile,
} from "./middleware/get.user";
import { getJournalsForUserId } from "./middleware/get.user.journals";
import { getAllJournalTagCountAnalytics } from "./middleware/get.user.journals.tags.analytics";
import { returnUsersSecurityQuestionsIfAny } from "./middleware/get.user.security";
import {
  updatePasswordMiddleware,
  updateFirstNameLastName,
} from "./middleware/patch.user";
import { createUserJournal } from "./middleware/post.user.journal";
import { putUserSecurityQuestionsOnUserDocument } from "./middleware/put.user.security";

import {
  mongooseUserIdValidator,
  newJournalValidator,
  newSecurityQuestionsValidator,
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

router.get(
  "/:userId/security",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  validateRouteRequest,
  returnUsersSecurityQuestionsIfAny
);

router.put(
  "/:userId/profile/security",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  newSecurityQuestionsValidator(),
  validateRouteRequest,
  putUserSecurityQuestionsOnUserDocument
);
export default router;
