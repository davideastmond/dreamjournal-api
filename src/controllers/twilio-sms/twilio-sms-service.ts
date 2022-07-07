require("dotenv").config();

import { IS_PRODUCTION } from "../../check-environment-variables";
import { TMessageData } from "./definitions";
const accountSid = IS_PRODUCTION
  ? process.env.PRODUCTION_TWILIO_ACCOUNT_SID
  : process.env.DEV_TWILIO_ACCOUNT_SID;

const authToken = IS_PRODUCTION
  ? process.env.PRODUCTION_TWILIO_AUTH_TOKEN
  : process.env.DEV_TWILIO_AUTH_TOKEN;

const sourceCTN = IS_PRODUCTION
  ? process.env.PRODUCTION_CTN
  : process.env.DEV_CTN;
const client = require("twilio")(accountSid, authToken);

export async function createTwilioTextMessage(messageData: TMessageData) {
  try {
    const message = await client.messages.create({
      ...messageData,
      from: sourceCTN,
    });
    console.log(message);
  } catch (exception: any) {
    console.log(exception.message);
    throw new Error(exception.message);
  }
}
