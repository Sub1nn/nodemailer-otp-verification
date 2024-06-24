import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 4000;

app.use(bodyParser.json());

app.use(cors());

const otps = {};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // You might need to set this to true in production
  },
});

app.post("/api/send-otp", (req, res) => {
  const { email } = req.body;
  const otp = crypto.randomInt(1000, 9999).toString();

  otps[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
    res.status(200).json({ message: "OTP sent successfully" });
  });
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otps[email] === otp) {
    delete otps[email];
    return res.status(200).json({ message: "OTP verified successfully" });
  }

  res.status(400).json({ message: "Invalid OTP" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
