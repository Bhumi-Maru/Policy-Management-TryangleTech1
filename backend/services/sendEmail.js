// services/sendEmail.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "marub8023@gmail.com", // Sender email address
    pass: "jxwk ojbz cueh khea", // Sender email password
  },
});

const sendEmail = async (to, subject, body) => {
  const mailOptions = {
    from: "marub8023@gmail.com", // Sender's email
    to: to, // Receiver's email
    subject: subject, // Email subject
    text: body, // Email body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    // Log the error stack for more detail
    console.error(error.stack);
    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};

module.exports = sendEmail;
