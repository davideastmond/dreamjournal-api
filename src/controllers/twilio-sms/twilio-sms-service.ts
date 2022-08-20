require("dotenv").config();

import { IS_PRODUCTION } from "../../check-environment-variables";
import { TMessageData } from "./definitions";
const accountSid = process.env.PRODUCTION_TWILIO_ACCOUNT_SID;

const authToken = process.env.PRODUCTION_TWILIO_AUTH_TOKEN;

const sourceCTN = IS_PRODUCTION
  ? process.env.PRODUCTION_CTN
  : process.env.NODE_ENV && process.env.NODE_ENV.match("test")
  ? process.env.TWILIO_DUMMY_TEST_CTN
  : process.env.PRODUCTION_CTN;
const client = require("twilio")(accountSid, authToken);

export async function createTwilioTextMessage(messageData: TMessageData) {
  try {
    const message = await client.messages.create({
      ...messageData,
      from: sourceCTN,
    });
    console.log(message);
  } catch (exception: any) {
    throw new Error(exception.message);
  }
}
