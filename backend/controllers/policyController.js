const Policy = require("../Models/Policy");

// Add Policy
const addPolicy = async (req, res) => {
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

    // Check if all required fields are provided
    if (
      !policyNumber ||
      !clientName ||
      !companyName ||
      !mainCategory ||
      !subCategory ||
      !issueDate ||
      !expiryDate ||
      !policyAmount
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure companyName is an array of ObjectIds
    if (!Array.isArray(companyName) || companyName.length === 0) {
      return res
        .status(400)
        .json({ message: "companyName should be an array of ObjectIds" });
    }

    // Check if 'policyAttachment' file exists
    if (!req.files || !req.files.policyAttachment) {
      return res.status(400).json({ message: "Policy attachment is required" });
    }

    // Get the policy attachment file path
    const policyAttachment = `/uploads/${req.files.policyAttachment[0].filename}`;

    // Create the policy
    const policy = await Policy.create({
      policyNumber,
      clientName,
      companyName,
      mainCategory,
      subCategory,
      issueDate,
      expiryDate,
      policyAmount,
      policyAttachment,
    });

    return res
      .status(201)
      .json({ message: "Policy added successfully", policy });
  } catch (error) {
    console.error("Error adding policy:", error);
    return res
      .status(500)
      .json({ message: "Error adding policy", error: error.message });
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
  addPolicy,
  getAllPolicies,
  getPolicyById,
  deletePolicy,
  updatePolicy,
};
