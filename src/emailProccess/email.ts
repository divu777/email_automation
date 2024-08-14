import { google } from "googleapis";
import { oauth2Client } from "../gmail/gmail";
import { generateReply, HeaderType } from "../groq/groq";
import { RedisCLient, startWorker } from "../redis/queue";

export async function processEmail(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Get the current timestamp to ignore previous emails
  const currentTime = new Date().getTime();
  console.log("starting workers ");
  startWorker(accessToken);
  console.log("Listening for new important emails...");

  setInterval(async () => {
    const messagesArray = await getEmails(accessToken);

    for (const message of messagesArray) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id!,
      });

      // Get the email's internal timestamp
      const internalDate = parseInt(msg.data.internalDate!);

      // Check if the email is received after the current time
      if (internalDate > currentTime) {
        console.log("New Important Email:");
        const headersEmail = msg.data.payload?.headers?.filter((obj) => {
          return obj.name === "From";
        });
        const messageBody = msg.data.snippet;
        console.log("Reading Email...");
        const reply = await generateReply(
          headersEmail as HeaderType[],
          messageBody as string,
          message.id!
        );

        await sendEmail(reply);
        // Mark the email as read by removing the UNREAD label
        await gmail.users.messages.modify({
          userId: "me",
          id: message.id!,
          requestBody: {
            removeLabelIds: ["UNREAD"], // Remove the UNREAD label
          },
        });
      }
    }
  }, 30000); // Poll every 30 seconds
}

export async function getEmails(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["UNREAD", "IMPORTANT", "CATEGORY_PERSONAL", "INBOX"],
  });
  return response.data.messages || [];
}

export async function sendEmail(reply: {
  subject: string;
  body: string;
  header: string;
}) {
  const client = await RedisCLient();
  try {
    await client.lPush("emails", JSON.stringify(reply));
  } catch (err) {
    console.log(err);
    console.log("error pushing the email in the queue");
  }
}
