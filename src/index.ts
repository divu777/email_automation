import e from "express";
import { generateAuthUrl, handleCallback, oauth2Client } from "./gmail/gmail";
import { processEmail } from "./emailProccess/email";

const app = e();

app.use(e.json());

app.get("/auth/gmail", (req, res) => {
  res.redirect(generateAuthUrl());
});

app.get("/auth/gmail/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const accessToken = await handleCallback(code);
    processEmail(accessToken!);
    res.send("Gmail Authenticaton done successfully");
  } catch (err) {
    console.log(err);
    res.send("error in Gmail Authentication , Try again in few minutes");
  }
});

app.listen(3000);
