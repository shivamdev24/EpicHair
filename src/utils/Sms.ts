import Twilio from "twilio";

// Environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("Twilio environment variables are not set");
}

const client = Twilio(accountSid, authToken);


export const sendOTP = async ({
  phoneNumber,
  otp,
  smsType,
}: {
  phoneNumber: string;
  otp?: string;
  smsType: string;
}) => {
  try {

    let message: string;
    
switch (smsType) {
  case "SIGNUP OTP":
    message = `Epichair: Your signup OTP is ${otp}. It is valid for 10 minutes.`;
    break;
  case "LOGIN OTP":
    message = `Epichair: Your login OTP is ${otp}. It is valid for 10 minutes.`;
    break;
  case "RESET":
    message = `Epichair: You requested to reset your password. Use this OTP: ${otp}. It is valid for 10 minutes.`;
    break;
  case "DELETE":
    message = `Epichair: You requested to DELETE ACCOUNT. Use this OTP: ${otp}. It is valid for 10 minutes.`;
    break;
  case "SIGNUP BY ADMIN":
    message = `Epichair: Your account has been created by an Admin. Please log in to continue.`;
    break;
  default:
    throw new Error("Invalid SMS type");
}

    // const message = `This is a test message from Twilio. Your ${smsType} is ${otp}. It is valid for 10 minutes.`;
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!, // Ensure this is set in your environment
      to: phoneNumber,
    });

    console.log("Twilio Response:", response.sid);
    return {
      success: true,
      message: `Your ${smsType} has been sent successfully.`,
      response,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error sending OTP:", error.message);
    return { success: false, error: error.message };
  }
};
