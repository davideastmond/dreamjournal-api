require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
import express from "express";
import cors from "cors";
import connectDB from "./database.config";
import authenticationRouter from "./routes/authentication/authentication.route";
import userRouter from "./routes/user/user.route";
import journalRouter from "./routes/journal/journal.route";
import { IS_PRODUCTION } from "./check-environment-variables";
import { validateAPIKey } from "./routes/authentication/middleware/validate-api-key";

const app = express();

if (IS_PRODUCTION) {
  app.set("trust proxy", 1);
}
console.log("Production mode?", IS_PRODUCTION);
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
const port = app.get("port");

const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

connectDB();
export default server;
