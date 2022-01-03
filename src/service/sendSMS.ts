import dotenv from "dotenv";
import Client from "twilio";
import Logger from "./../utils/Logger.js";

interface SMSStatus {
  error: Error | null;
  status: string;
}

dotenv.config();

const twilio = {
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  number: process.env.TWILIO_NUMBER!,
};

const client = Client(twilio.accountSid, twilio.authToken);

async function sendSMS(recipientPhone: string, message: string): Promise<SMSStatus> {
  try {
    await client.messages.create({
      body: message,
      from: twilio.number,
      to: recipientPhone,
    });
    Logger.log("info", new Error("SMS sent successfully"), import.meta.url);
    return { error: null, status: "success" };
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    return { error: new Error("Error sending SMS"), status: "failure" };
  }
}

export default sendSMS;
