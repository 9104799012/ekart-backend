import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendotp = async (otp, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailConfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is: <b>${otp}</b></p>`,
    };

    await transporter.sendMail(mailConfigurations);
    console.log("OTP Email sent successfully");

  } catch (error) {
    console.log("OTP Email error:", error);
    throw new Error("Failed to send OTP");
  }
};
