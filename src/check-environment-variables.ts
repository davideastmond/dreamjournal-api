require("dotenv").config();

function isProduction() {
  if (process.env.NODE_ENV && process.env.NODE_ENV.match("development"))
    return false;
  if (process.env.NODE_ENV && process.env.NODE_ENV.match("test")) return false;
  return true;
}
export const IS_PRODUCTION = isProduction();
