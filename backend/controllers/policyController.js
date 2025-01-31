const Policy = require("../Models/Policy");
const SubPolicy = require("../Models/SubPolicy");

//add policy
const addPolicy = async (req, res) => {
  try {
    const {
      policyNumber,
      clientName,
      mainCategory,
      subCategory,
      companyName,
      issueDate,
      expiryDate,
      policyAmount,
    } = req.body;

    if (
      !policyNumber ||
      !clientName ||
      !mainCategory ||
      !subCategory ||
      !companyName ||
      !issueDate ||
      !expiryDate ||
      !policyAmount
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const policyAttachments = req.files?.policyAttachment
      ? req.files.policyAttachment.map((file) => `/uploads/${file.filename}`)
      : [];

    const newSubPolicy = new SubPolicy({
      companyName,
      issueDate,
      expiryDate,
      policyAmount,
      policyAttachment: policyAttachments,
    });

    await newSubPolicy.save();

    const newPolicy = new Policy({
      policyNumber,
      clientName,
      mainCategory,
      subCategory,
      subPolicy: newSubPolicy._id,
    });

    await newPolicy.save();

    return res
      .status(201)
      .json({ message: "Policy added successfully", policy: newPolicy });
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
      .populate("mainCategory", "mainCategoryName")
      .populate("subCategory", "subCategoryName")
      .populate(
        "subPolicy",
        "companyName entryDate issueDate expiryDate policyAmount policyAttachment"
      );

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
      .populate("mainCategory", "mainCategoryName")
      .populate("subCategory", "subCategoryName")
      .populate(
        "subPolicy",
        "companyName entryDate issueDate expiryDate policyAmount policyAttachment"
      );
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
    const {
      clientName,
      mainCategory,
      subCategory,
      companyName,
      issueDate,
      expiryDate,
      policyAmount,
    } = req.body;

    const existingPolicy = await Policy.findById(id).populate("subPolicy");
    if (!existingPolicy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    existingPolicy.clientName = clientName || existingPolicy.clientName;
    existingPolicy.mainCategory = mainCategory || existingPolicy.mainCategory;
    existingPolicy.subCategory = subCategory || existingPolicy.subCategory;

    if (existingPolicy.subPolicy) {
      const subPolicyUpdates = {
        companyName: companyName || existingPolicy.subPolicy.companyName,
        issueDate: issueDate || existingPolicy.subPolicy.issueDate,
        expiryDate: expiryDate || existingPolicy.subPolicy.expiryDate,
        policyAmount: policyAmount || existingPolicy.subPolicy.policyAmount,
      };

      if (req.files?.policyAttachment) {
        const updatedAttachments = req.files.policyAttachment.map(
          (file) => `/uploads/${file.filename}`
        );
        subPolicyUpdates.policyAttachment = updatedAttachments;
      }

      await SubPolicy.findByIdAndUpdate(
        existingPolicy.subPolicy._id,
        subPolicyUpdates
      );
    }

    await existingPolicy.save();
    return res.status(200).json({
      message: "Policy and SubPolicy updated successfully",
      policy: existingPolicy,
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
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const { id } = req.params; // Get policy ID from the route parameter
    const { companyName, entryDate, issueDate, expiryDate, policyAmount } =
      req.body;

    // Validate required fields
    if (
      !companyName ||
      !issueDate ||
      !expiryDate ||
      !policyAmount ||
      !req.files?.policyAttachment
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Process the uploaded files
    const policyAttachments = req.files.policyAttachment.map(
      (file) => `/uploads/${file.filename}`
    );

    // Create a new subPolicy
    const newSubPolicy = new SubPolicy({
      companyName,
      entryDate,
      issueDate,
      expiryDate,
      policyAmount,
      policyAttachment: policyAttachments,
    });

    // Save the sub-policy
    await newSubPolicy.save();

    // Find the policy by ID and add the sub-policy to the policy
    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    policy.subPolicy.push(newSubPolicy._id); // Add sub-policy ID to the policy's subPolicy array
    await policy.save(); // Save the updated policy

    return res.status(201).json({
      message: "Sub-policy added successfully",
      subPolicy: newSubPolicy,
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

// Delete sub policy
const deleteSubPolicy = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the sub-policy to be deleted
    const subPolicy = await SubPolicy.findById(id);
    if (!subPolicy) {
      return res.status(404).json({ message: "Sub-policy not found" });
    }

    // Find the parent policy that contains this sub-policy
    const policy = await Policy.findOne({ subPolicy: id });
    if (!policy) {
      return res.status(404).json({ message: "Parent policy not found" });
    }

    // Remove the sub-policy ID from the parent policy's subPolicy array
    policy.subPolicy = policy.subPolicy.filter(
      (subPolicyId) => subPolicyId.toString() !== id
    );
    await policy.save();

    // Delete the sub-policy
    await SubPolicy.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Sub-policy deleted successfully",
      subPolicy,
    });
  } catch (error) {
    console.error("Error deleting sub-policy:", error);
    return res.status(500).json({
      message: "Error deleting sub-policy",
      error: error.message,
    });
  }
};

// Update Sub-Policy
const updateSubPolicy = async (req, res) => {
  try {
    const { policyId, subPolicyId } = req.params;
    const { companyName, entryDate, issueDate, expiryDate, policyAmount } =
      req.body;

    if (!companyName || !issueDate || !expiryDate || !policyAmount) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const existingSubPolicy = await SubPolicy.findById(subPolicyId);
    if (!existingSubPolicy) {
      return res.status(404).json({ message: "Sub-policy not found" });
    }

    const updatedSubPolicyData = {
      companyName: companyName || existingSubPolicy.companyName,
      entryDate: entryDate || existingSubPolicy.entryDate,
      issueDate: issueDate || existingSubPolicy.issueDate,
      expiryDate: expiryDate || existingSubPolicy.expiryDate,
      policyAmount: policyAmount || existingSubPolicy.policyAmount,
    };

    // Handle file updates if any
    if (req.files?.policyAttachment) {
      const updatedAttachments = req.files.policyAttachment.map(
        (file) => `/uploads/${file.filename}`
      );
      updatedSubPolicyData.policyAttachment =
        updatedAttachments.length === 1
          ? updatedAttachments[0]
          : updatedAttachments;
    }

    // Update the sub-policy in the database
    const updatedSubPolicy = await SubPolicy.findByIdAndUpdate(
      subPolicyId,
      updatedSubPolicyData,
      { new: true }
    );

    if (!updatedSubPolicy) {
      return res.status(404).json({ message: "Sub-policy update failed." });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const subPolicyIndex = policy.subPolicy.findIndex(
      (subPolicy) => subPolicy.toString() === subPolicyId
    );
    if (subPolicyIndex >= 0) {
      policy.subPolicy[subPolicyIndex] = subPolicyId;
      await policy.save();
    }

    // Ensure a clean response for the `policyAttachment`
    return res.status(200).json({
      message: "Sub-policy updated successfully",
      subPolicy: {
        ...updatedSubPolicy._doc,
        policyAttachment:
          Array.isArray(updatedSubPolicy.policyAttachment) &&
          updatedSubPolicy.policyAttachment.length === 1
            ? updatedSubPolicy.policyAttachment[0]
            : updatedSubPolicy.policyAttachment,
      },
    });
  } catch (error) {
    console.error("Error updating sub-policy:", error);
    return res.status(500).json({
      message: "Error updating sub-policy",
      error: error.message,
    });
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
  deleteSubPolicy,
  updateSubPolicy,
};
