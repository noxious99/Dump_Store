const nodemailer = require("nodemailer");
const dotenv = require('dotenv')
dotenv.config()


const SMTP_HOST = 'smtp.maileroo.com';
const SMTP_PORT = 2525;
const SMTP_USERNAME = process.env.SMTP_USERNAME
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const SMTP_SENDER_NAME = 'Dump Store';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  Authentication: 'Yes',
  Encryption: 'SSL',
  auth: {
    user: SMTP_USERNAME, 
    pass: SMTP_PASSWORD,
  },
  requireTLS: true,
});

async function sendResetEmail(toEmail, resetLink) {
  try {
    const mailOptions = {
      from: `Dump Store <dumpstore@afabdbe10ac09173.maileroo.org>`,
      to: 'rahman.rafiur.8132@gmail.com',
      subject: "hello",
      html: `<p>hello hey</p>`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return "Failed to send email"
      } else {
        return info
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendResetEmail;
