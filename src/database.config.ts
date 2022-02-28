require("dotenv").config();

import { connect, ConnectOptions } from "mongoose";
import { IS_PRODUCTION } from "./check-environment-variables";

const MONGO_URI = IS_PRODUCTION
  ? process.env.PRODUCTION_MONGO_URI
  : process.env.DEV_MONGO_URI;

const connectDB = async () => {
  try {
    const mongoURI: string = MONGO_URI;
    const options: ConnectOptions = {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    };
    await connect(mongoURI, options);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
