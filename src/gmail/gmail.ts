import { google } from "googleapis";
import { config } from "../config/config";

export const oauth2Client = new google.auth.OAuth2(
  config.gmail.clientId,
  config.gmail.clientSecret,
  config.gmail.redirectUrl
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
];

export function generateAuthUrl() {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
  });

  return url;
}

//gets the token from oauth2client and return to the router handler

export async function handleCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens.access_token;
}
