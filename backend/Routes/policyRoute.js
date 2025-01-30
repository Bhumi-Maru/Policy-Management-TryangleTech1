const express = require("express");
const {
  addPolicy,
  updatePolicy,
  getAllPolicies,
  deletePolicy,
  getPolicyById,
  addSubPolicy,
  getAllSubPolicies,
  getSubPolicyById,
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

//subPolicy
//Add subPolicy (POST)
policyRouter.post("/sub-policy", addSubPolicy);

// Get all subPolicies (GET)
policyRouter.get("/sub-policy", getAllSubPolicies);

// Get subPolicy by ID (GET)
policyRouter.get("/sub-policy/:id", getSubPolicyById);

module.exports = policyRouter;
