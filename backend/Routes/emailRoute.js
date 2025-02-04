// Routes/emailRoute.js
const express = require("express");
const sendEmail = require("../services/sendEmail");

const emailRouter = express.Router();

// POST route to send an email
emailRouter.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res
      .status(400)
      .json({ success: false, message: "Missing email details" });
  }

  const result = await sendEmail(to, subject, body);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

module.exports = emailRouter;
