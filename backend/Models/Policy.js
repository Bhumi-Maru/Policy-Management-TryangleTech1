const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true },
    clientName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

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
    subPolicy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubPolicy",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Policy = mongoose.model("Policy", policySchema);

module.exports = Policy;
