import dotenv from "dotenv";

dotenv.config();

export const config = {
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID!,
    clientSecret: process.env.GMAIL_CLIENT_SECRET!,
    redirectUrl: process.env.GMAIL_REDIRECT_URL!,
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY!,
  },
};
