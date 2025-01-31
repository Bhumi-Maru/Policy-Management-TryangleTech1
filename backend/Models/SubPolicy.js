const mongoose = require("mongoose");

const subPolicySchema = new mongoose.Schema({
  entryDate: { type: Date, default: Date.now },
  companyName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  policyAmount: { type: String, required: true },
  policyAttachment: [{ type: String, default: null }],
});

const SubPolicy = mongoose.model("SubPolicy", subPolicySchema);
module.exports = SubPolicy;
