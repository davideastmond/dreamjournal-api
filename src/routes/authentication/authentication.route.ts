require("dotenv").config();

import * as express from "express";
import { Request, Response } from "express";
import { validateRouteRequest } from "../middleware/validate-route-request";
import {
  initiatePasswordRecoveryRequestValidator,
  loginAuthenticationValidator,
  recoveryRequestValidator,
  registrationValidator,
} from "./middleware/authentication.validators";
import { validateAPIKey } from "./middleware/validate-api-key";
import {
  createUniqueUser,
  generateAndSendToken,
} from "./middleware/post.authentication";
import { jwtVerifyMiddleWare } from "./middleware/jwt-middleware";
import { authenticateRequest } from "./middleware/authentication-password-recovery-request";
import { authenticatePasswordRecoveryRequest } from "./middleware/authenticate-request";

const router = express.Router();

router.post(
  "/login",
  validateAPIKey,
  loginAuthenticationValidator(),
  validateRouteRequest,
  generateAndSendToken
);

router.post(
  "/register",
  validateAPIKey,
  registrationValidator(),
  validateRouteRequest,
  createUniqueUser
);

router.get(
  "/session",
  validateAPIKey,
  jwtVerifyMiddleWare,
  (req: Request, res: Response) => {
    res.status(200).send({ response: "OK" });
  }
);

// Initialize the password recovery request. User doesn't need a JWT
// This should receive the e-mail and dob, authenticate it and then
// send e-mail to user with special recover link
router.post(
  "/password-recovery/request",
  validateAPIKey,
  initiatePasswordRecoveryRequestValidator(),
  validateRouteRequest,
  authenticateRequest
);

/* This expects an encrypted token which contains the email and the raw UUID.
// We should authenticate this and then send a response. If the response is OK
 the front end will display a form allowing user to submit a new password.
 We should send an acceptanceToken to user
 */
// This is post because we need to generate an acceptanceToken, and update the user object
router.post(
  "/password-recovery/authenticate",
  validateAPIKey,
  recoveryRequestValidator(),
  validateRouteRequest,
  authenticatePasswordRecoveryRequest
);
export default router;
