const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    policyNumber: { type: String },
    clientName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    companyName: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    entryDates: { type: [Date], default: Date.now },
    issueDates: { type: [String] },
    expiryDates: { type: [String] },
    policyAmounts: { type: [String] },
    policyAttachments: { type: [String] },
  },
  { timestamps: true }
);

const Policy = mongoose.model("Policy", policySchema);

module.exports = Policy;
