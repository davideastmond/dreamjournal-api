require("dotenv").config();

import * as express from "express";
import { validateRouteRequest } from "../middleware/validate-route-request";
import {
  loginAuthenticationValidator,
  registrationValidator,
} from "./middleware/authentication.validators";
import { validateAPIKey } from "./middleware/validate-api-key";
import {
  createUniqueUser,
  generateAndSendToken,
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
  (req: any, res: any) => {
    res.status(200).send({ response: "OK" });
  }
);

export default router;