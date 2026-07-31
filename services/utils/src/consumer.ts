import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

type Message = {
  to: string;
  subject: string;
  html: string;
};
console.log("MAIL_ID:", process.env.MAIL_ID);
export const sendMail = async (message: Message) => {
  try {
    console.log("Sending email to:", message.to);
    const { to, subject, html } = message;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_KEY,
      },
    });

    const info = await transporter.sendMail({
      from: `"Work-Sphere" <${process.env.MAIL_ID}>`,
      to,
      subject,
      html,
    });
    console.log(`Mail has been sent to ${to}`);
  } catch (error: any) {
    console.log("Failed to send message ", error);
  }
};
