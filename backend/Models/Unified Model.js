const mongoose = require("mongoose");

const unifiedSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String }, // Only for 'user'
  streetAddress: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  zip: { type: String, required: true },
  aadharCard: {
    type: String,
    required: function () {
      return this.role !== "user";
    },
  }, // Not required for 'user'
  pan: {
    type: String,
    required: function () {
      return this.role !== "user";
    },
  }, // Not required for 'user'
  otherDocuments: { type: [String] },
  status: { type: String, default: "active" },
  role: { type: String, enum: ["client", "agent", "user"], required: true },
});

const UnifiedModel = mongoose.model("UnifiedModel", unifiedSchema);

module.exports = UnifiedModel;
