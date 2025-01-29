const express = require("express");
const {
  addPolicy,
  updatePolicy,
  getAllPolicies,
  deletePolicy,
  getPolicyById,
} = require("../controllers/policyController");
const { uploadFields } = require("../middleware/uploadMiddleware");

const policyRouter = express.Router();

// Add policy (POST)
policyRouter.post("/policy", uploadFields, addPolicy);

// Update policy (PUT)
policyRouter.put("/policy/:id", uploadFields, updatePolicy);

// Get all policies (GET)
policyRouter.get("/policy", getAllPolicies);

// Get policy by ID (GET)
policyRouter.get("/policy/:id", getPolicyById);

// Delete policy (DELETE)
policyRouter.delete("/policy/:id", deletePolicy);

module.exports = policyRouter;
