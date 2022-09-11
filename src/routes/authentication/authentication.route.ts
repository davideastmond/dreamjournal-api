require("dotenv").config();

import * as express from "express";
import { Request, Response } from "express";
import { validateRouteRequest } from "../middleware/validate-route-request";
import {
  loginAuthenticationValidator,
  registrationValidator,
  TFAVerifyValidator,
} from "./middleware/authentication.validators";
import { validateAPIKey } from "./middleware/validate-api-key";
import {
  createUniqueUser,
  generateAndSendToken,
  processTFAVerification,
} from "./middleware/post.authentication";
import { jwtVerifyMiddleWare } from "./middleware/jwt-middleware";

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

router.post(
  "/security/tfa/verify",
  validateAPIKey,
  jwtVerifyMiddleWare,
  TFAVerifyValidator(),
  validateRouteRequest,
  processTFAVerification
);
export default router;
