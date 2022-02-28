require("dotenv").config();
// const bodyParser = require("body-parser");
import express from "express";
import cors from "cors";
import connectDB from "./database.config";
import {
  // checkEnvironmentVariables,
  IS_PRODUCTION,
} from "./check-environment-variables";

const app = express();

// const DOMAIN = IS_PRODUCTION
//   ? process.env.PRODUCTION_COOKIE_DOMAIN
//   : process.env.DEV_COOKIE_DOMAIN;

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
// IS_PRODUCTION && app.use(validateAPIToken);

app.set("port", process.env.PORT || 5000);

app.get("/", (_req, res) => {
  res.send("API Running");
});
const port = app.get("port");

const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);
connectDB();
export default server;
