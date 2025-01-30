const Policy = require("../Models/Policy");
const SubPolicy = require("../Models/SubPolicy");

//add policy
const addPolicy = async (req, res) => {
  try {
    const { policyNumber, clientName, mainCategory, subCategory, subPolicy } =
      req.body;

    // Validate required fields
    if (
      !policyNumber ||
      !clientName ||
      !mainCategory ||
      !subCategory ||
      !subPolicy
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Create a new policy instance
    const newPolicy = new Policy({
      policyNumber,
      clientName,
      mainCategory,
      subCategory,
      subPolicy,
    });

    // Save the policy to the database
    await newPolicy.save();

    return res.status(201).json({
      message: "Policy added successfully",
      policy: newPolicy,
    });
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
      .populate("subCategory", "subCategoryName")
      .populate("subPolicy", "subPolicy");
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

/////// addSub policy ////////
const addSubPolicy = async (req, res) => {
  try {
    const {
      companyName,
      entryDate,
      issueDate,
      expiryDate,
      policyAmount,
      policyAttachment,
    } = req.body;

    // Validate required fields
    if (
      !companyName ||
      !issueDate ||
      !expiryDate ||
      !policyAmount ||
      !policyAttachment
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Create a new subPolicy
    const newSubPolicy = new SubPolicy({
      companyName,
      entryDate,
      issueDate,
      expiryDate,
      policyAmount,
      policyAttachment,
    });

    // Save the policy to the database
    await newSubPolicy.save();

    return res.status(201).json({
      message: "subPolicy added successfully",
      policy: newSubPolicy,
    });
  } catch (error) {
    console.error("Error adding subPolicy:", error);
    return res
      .status(500)
      .json({ message: "Error adding subPolicy", error: error.message });
  }
};

// Fetch all policies
const getAllSubPolicies = async (req, res) => {
  try {
    const subPolicies = await SubPolicy.find();
    return res.status(200).json(subPolicies);
  } catch (error) {
    console.error("Error fetching subPolicies:", error);
    return res
      .status(500)
      .json({ message: "Error fetching subPolicies", error: error.message });
  }
};

// Fetch a policy by ID
const getSubPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const subPolicy = await SubPolicy.findById(id);

    if (!subPolicy) {
      return res.status(404).json({ message: "subPolicy not found" });
    }
    return res.status(200).json(subPolicy);
  } catch (error) {
    console.error("Error fetching subPolicy by ID:", error);
    return res
      .status(500)
      .json({ message: "Error fetching subPolicy", error: error.message });
  }
};

module.exports = {
  addPolicy,
  getAllPolicies,
  getPolicyById,
  deletePolicy,
  updatePolicy,
  addSubPolicy,
  getAllSubPolicies,
  getSubPolicyById,
};
