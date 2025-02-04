// Routes/emailRoute.js
const express = require("express");
const sendEmail = require("../services/sendEmail");
const emailRouter = express.Router();

emailRouter.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body;
  console.log("Received email data:", { to, subject, body }); // Debug log

  if (!to || !subject || !body) {
    return res
      .status(400)
      .json({ success: false, message: "Missing email details" });
  }

  const result = await sendEmail(to, subject, body);
  console.log(result); // Debug log
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

module.exports = emailRouter;
