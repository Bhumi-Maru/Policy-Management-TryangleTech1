const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true },
    clientName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    companyName: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
      },
    ],
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    entryDate: { type: Date, default: Date.now },
    issueDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    policyAmount: { type: String, required: true },
    policyAttachment: { type: [String], required: true },
  },
  { timestamps: true }
);

const Policy = mongoose.model("Policy", policySchema);

module.exports = Policy;
