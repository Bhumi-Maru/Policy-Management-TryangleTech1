const Policy = require("../Models/Policy");

// Add or Append Policy Data
const addOrAppendPolicy = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("Uploaded files:", req.files);

    const {
      policyNumber,
      clientName,
      companyName,
      mainCategory,
      subCategory,
      issueDate,
      expiryDate,
      policyAmount,
    } = req.body;

    const { id } = req.body;

    let policyAttachment = [];
    if (req.files && req.files.policyAttachment?.length > 0) {
      policyAttachment = req.files.policyAttachment.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    let policy;

    if (id) {
      // Find existing policy by ID and append new data
      policy = await Policy.findById(id);

      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      // Append data only if it exists in the request
      if (issueDate) {
        Array.isArray(issueDate)
          ? policy.issueDate.push(...issueDate)
          : policy.issueDate.push(issueDate);
      }

      if (expiryDate) {
        Array.isArray(expiryDate)
          ? policy.expiryDate.push(...expiryDate)
          : policy.expiryDate.push(expiryDate);
      }

      if (policyAmount) {
        Array.isArray(policyAmount)
          ? policy.policyAmount.push(...policyAmount)
          : policy.policyAmount.push(policyAmount);
      }

      if (companyName) {
        Array.isArray(companyName)
          ? policy.companyName.push(...companyName)
          : policy.companyName.push(companyName);
      }

      if (policyAttachment.length > 0) {
        policy.policyAttachment.push(...policyAttachment);
      }

      // Save the updated policy
      await policy.save();

      return res.status(200).json({
        message: "Policy updated with new data successfully",
        policy,
      });
    } else {
      // If no ID provided, create a new policy
      policy = await Policy.create({
        policyNumber,
        clientName: clientName || null,
        companyName: Array.isArray(companyName) ? companyName : [],
        mainCategory: mainCategory || null,
        subCategory: subCategory || null,
        issueDate: Array.isArray(issueDate) ? issueDate : [issueDate],
        expiryDate: Array.isArray(expiryDate) ? expiryDate : [expiryDate],
        policyAmount: Array.isArray(policyAmount)
          ? policyAmount
          : [policyAmount],
        policyAttachment: policyAttachment,
      });

      return res.status(201).json({
        message: "Policy created successfully",
        policy,
      });
    }
  } catch (error) {
    console.error("Error adding or appending policy:", error);
    return res.status(500).json({
      message: "Error adding or appending policy",
      error: error.message,
    });
  }
};

// Fetch all policies
const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate("clientName", "firstName lastName")
      .populate("companyName", "companyName")
      .populate("mainCategory", "mainCategoryName")
      .populate("subCategory", "subCategoryName");
    return res.status(200).json(policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    return res
      .status(500)
      .json({ message: "Error fetching policies", error: error.message });
  }
};

// Fetch a policy by ID
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findById(id)
      .populate("clientName", "firstName lastName")
      .populate("companyName", "companyName")
      .populate("mainCategory", "mainCategoryName")
      .populate("subCategory", "subCategoryName");
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    return res.status(200).json(policy);
  } catch (error) {
    console.error("Error fetching policy by ID:", error);
    return res
      .status(500)
      .json({ message: "Error fetching policy", error: error.message });
  }
};

// Delete policy
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findByIdAndDelete(id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    return res
      .status(200)
      .json({ message: "Policy deleted successfully", policy });
  } catch (error) {
    console.error("Error deleting policy:", error);
    return res
      .status(500)
      .json({ message: "Error deleting policy", error: error.message });
  }
};

// Update policy
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Handle updated file upload if provided
    if (req.files) {
      if (req.files.policyAttachment) {
        updates.policyAttachment = `/uploads/${req.files.policyAttachment[0].filename}`;
      }
    }

    // Perform the update
    const updatedPolicy = await Policy.findByIdAndUpdate(id, updates);

    if (!updatedPolicy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    return res.status(200).json({
      message: "Policy updated successfully",
      updatedPolicy,
    });
  } catch (error) {
    console.error("Error updating policy:", error);
    return res
      .status(500)
      .json({ message: "Error updating policy", error: error.message });
  }
};

module.exports = {
  addOrAppendPolicy,
  getAllPolicies,
  getPolicyById,
  deletePolicy,
  updatePolicy,
};
