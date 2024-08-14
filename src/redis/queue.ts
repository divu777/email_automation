import { google } from "googleapis";
import { createClient, RedisClientType } from "redis";
import { oauth2Client } from "../gmail/gmail";

export async function RedisCLient() {
  const client: RedisClientType = createClient();
  await client.connect();
  return client;
}

//Redis Worker Picks up the messages from the queue and sends reply ,passed by the sendEmail fnc

export async function startWorker(accessToken: string) {
  const client = await RedisCLient();
  try {
    while (true) {
      const response = await client.brPop("emails", 0);
      if (response) {
        const { element } = response;

        const obj = JSON.parse(element);
        const messageId = obj.messageId;
        oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: "v1", auth: oauth2Client });
        const res = await gmail.users.messages.get({
          userId: "me",
          id: messageId!,
          format: "metadata",
          metadataHeaders: ["Subject", "From"],
        });
        const from = obj.header;
        const subject = obj.subject;
        const replyTo = from.match(/<(.*)>/)[1];
        const replySubject = subject.startsWith("Re:")
          ? subject
          : `Re: ${subject}`;
        const replyBody = obj.body;
        const rawMessage = [
          `From: me`,
          `To: ${replyTo}`,
          `Subject: ${replySubject}`,
          `In-Reply-To: ${messageId}`,
          `References: ${messageId}`,
          ``,
          replyBody,
        ].join("\n");

        const encodedMessage = Buffer.from(rawMessage)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "-")
          .replace(/=+$/, "");

        await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage,
          },
        });
        console.log("email sent successfully");
      }
    }
  } catch (err) {
    console.log(err);
    console.log("error in starting Redis Worker");
  }
}
