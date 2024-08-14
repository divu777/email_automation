import Groq from "groq-sdk";
import { config } from "../config/config";

const groq = new Groq({ apiKey: config.groq.apiKey });

export interface HeaderType {
  name: string;
  value: string;
}

export async function generateReply(
  headers: HeaderType[],
  body: string,
  messageId: string
) {
  const chatCompletion = await getGroqChatCompletion(headers[0].value, body);
  const replyContent = chatCompletion.choices[0]?.message?.content || "";
  const subject = await getSubjectFromGroq(headers[0].value, body);
  console.log("Generating Email Reply");
  const header =
    headers.find((header) => header.name.toLowerCase() === "from")?.value ||
    "recipient@example.com";
  return {
    subject,
    body: replyContent,
    header,
    messageId,
  };
}
// A function to get the body content from Groq
export async function getGroqChatCompletion(from: string, body: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "you are my email writing assistant. I will provide you with the email, and you write me a short and concise response. If you are not able to generate a reply, just send a simple 'We will get back to you soon' kind of mail. There should be NO starting message from your side. For example, here is a concise reply:",
      },
      {
        role: "user",
        content: `I got an Email from ${from} and the body contains ${body}. Just give me the reply, nothing else.`,
      },
    ],
    model: "llama3-8b-8192",
  });
}

// A function to get the subject from Groq
export async function getSubjectFromGroq(from: string, body: string) {
  const subjectCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are my email subject assistant. I will provide you with an email, and you will generate a short and concise subject. There should be NO starting message from your side.",
      },
      {
        role: "user",
        content: `I got an Email from ${from} and the body contains ${body}. Just give me the subject, nothing else.`,
      },
    ],
    model: "llama3-8b-8192",
  });

  return subjectCompletion.choices[0]?.message?.content || "No Subject";
}
