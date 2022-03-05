require("dotenv").config();
const bodyParser = require("body-parser");
import express from "express";
import cors from "cors";
import connectDB from "./database.config";

import authenticationRouter from "./routes/authentication/authentication"
import {
  IS_PRODUCTION,
} from "./check-environment-variables";
import { validateAPIKey } from "./routes/authentication/middleware/verify-api-key";

const app = express();



if (IS_PRODUCTION) {
	app.set("trust proxy", 1);
}
console.log("Production mode?", IS_PRODUCTION);
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(bodyParser.json());
// IS_PRODUCTION && app.use(validateAPIToken);

app.set("port", process.env.PORT || 5000);

app.get("/", validateAPIKey, (_req, res) => {
  res.status(200).send({ status: "API is running" });
});

app.use("/api/auth", authenticationRouter)
const port = app.get("port");

const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

connectDB();
export default server;
