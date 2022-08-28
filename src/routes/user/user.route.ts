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
import { getTwoFactorAuthStatus } from "./middleware/get.user.security";
import {
  updatePasswordMiddleware,
  patchPersonalInfo,
  cancelTwoFactorAuthentication,
} from "./middleware/patch.user";
import { createUserJournal } from "./middleware/post.user.journal";
import { enrollTwoFactorAuthentication } from "./middleware/post.user.security.tfa";

import {
  mongooseUserIdValidator,
  newJournalValidator,
  restrictedAccessToSessionUserData,
  userBasicProfileUpdateValidator,
  userPasswordUpdateValidator,
  twoFactorAuthCTNBodyValidator,
  twoFactorPlainTextPasswordValidator,
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
  restrictedAccessToSessionUserData,
  updatePasswordMiddleware
);

router.patch(
  "/:userId/profile/basic",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  userBasicProfileUpdateValidator(),
  validateRouteRequest,
  restrictedAccessToSessionUserData,
  patchPersonalInfo
);

router.get(
  "/:userId/profile/security/tfa/status",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  validateRouteRequest,
  restrictedAccessToSessionUserData,
  getTwoFactorAuthStatus
);

router.post(
  "/:userId/profile/security/tfa/enroll",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  twoFactorAuthCTNBodyValidator(),
  validateRouteRequest,
  restrictedAccessToSessionUserData,
  enrollTwoFactorAuthentication
);

router.patch(
  "/:userId/profile/security/tfa",
  validateAPIKey,
  jwtVerifyMiddleWare,
  mongooseUserIdValidator(),
  twoFactorPlainTextPasswordValidator(),
  validateRouteRequest,
  restrictedAccessToSessionUserData,
  cancelTwoFactorAuthentication
);
export default router;
