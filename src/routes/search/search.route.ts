require("dotenv").config();

import * as express from "express";
import { jwtVerifyMiddleWare } from "../authentication/middleware/jwt-middleware";
import { validateAPIKey } from "../authentication/middleware/validate-api-key";
import { validateRouteRequest } from "../middleware/validate-route-request";
import { doSearch } from "./middleware/get.search";

const router = express.Router();

router.get(
  "/",
  validateAPIKey,
  jwtVerifyMiddleWare,
  validateRouteRequest,
  doSearch
);
export default router;
