require("dotenv").config();

export const IS_PRODUCTION = !(
  process.env.NODE_ENV && process.env.NODE_ENV.match("development")
);
