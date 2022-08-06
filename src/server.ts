require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
import express from "express";
import cors from "cors";

import authenticationRouter from "./routes/authentication/authentication.route";
import userRouter from "./routes/user/user.route";
import journalRouter from "./routes/journal/journal.route";
import searchRouter from "./routes/search/search.route";
import { IS_PRODUCTION } from "./check-environment-variables";
import { validateAPIKey } from "./routes/authentication/middleware/validate-api-key";
import { createServer } from "http";
const app = express();
const httpServer = createServer(app);

if (IS_PRODUCTION) {
  app.set("trust proxy", 1);
}
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: true,
    exposedHeaders: ["X-JWT-Token", "X-Renewed-JWT-Token"],
  })
);
app.use(bodyParser.json());
// IS_PRODUCTION && app.use(validateAPIToken);

app.set("port", process.env.PORT || 5000);

app.get("/", validateAPIKey, (_req, res) => {
  res.status(200).send({ status: "API is running" });
});

app.use("/api/auth", authenticationRouter);
app.use("/api/user", userRouter);
app.use("/api/journal", journalRouter);
app.use("/api/search", searchRouter);

export default httpServer;
