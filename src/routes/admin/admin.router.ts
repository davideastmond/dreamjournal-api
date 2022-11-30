import * as express from "express";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { mongooseJournalIdValidator } from "../journal/middleware/journal.validators";
import { validateRouteRequest } from "../middleware/validate-route-request";
import { mongooseUserIdValidator } from "../user/middleware/user.validators";
import { validateAdminPwd } from "./middleware/admin-middleware";
import { grabJournalById, grabUserAdmin } from "./middleware/get.admin";

const router = express.Router();

/**
 * This gets a raw user object. Requires admin password in the auth header
 * Requires a userId in the request params
 */
router.get(
  "/user/:userId",
  validateAPIKey,
  validateAdminPwd,
  mongooseUserIdValidator(),
  validateRouteRequest,
  grabUserAdmin
);

router.get(
  "/journal/:journalId",
  validateAPIKey,
  validateAdminPwd,
  mongooseJournalIdValidator(),
  validateRouteRequest,
  grabJournalById
);
export default router;
