const mongoose = require("mongoose"); // Ensure mongoose is required
const Policy = require("../Models/Policy");

// Add Policy (either new policy or add to existing policy)
const addPolicy = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("Uploaded files:", req.files);

    const {
      _id, // Check if the ID exists to add data to an existing policy
      clientName,
      companyName,
      mainCategory,
      subCategory,
      entryDates,
      issueDates,
      expiryDates,
      policyAmounts,
    } = req.body;

    // Handle file uploads correctly
    const policyAttachments = req.files?.policyAttachments
      ? req.files.policyAttachments.map((file) => `/uploads/${file.filename}`)
      : [];

    // Ensure that companyName is an array of ObjectIds
    const companyNameArray = Array.isArray(companyName)
      ? companyName.map((id) => new mongoose.Types.ObjectId(id)) // Using 'new' to correctly instantiate ObjectIds
      : typeof companyName === "string"
      ? companyName.split(",").map((id) => new mongoose.Types.ObjectId(id)) // Using 'new' for each ObjectId if it's a string
      : [];

    // Split the comma-separated strings into arrays (if they are strings)
    const issueDatesArray = Array.isArray(issueDates)
      ? issueDates
      : typeof issueDates === "string" && issueDates
      ? issueDates.split(",")
      : [];
    const expiryDatesArray = Array.isArray(expiryDates)
      ? expiryDates
      : typeof expiryDates === "string" && expiryDates
      ? expiryDates.split(",")
      : [];
    const policyAmountsArray = Array.isArray(policyAmounts)
      ? policyAmounts
      : typeof policyAmounts === "string" && policyAmounts
      ? policyAmounts.split(",")
      : [];
    const entryDatesArray = Array.isArray(entryDates)
      ? entryDates
      : typeof entryDates === "string" && entryDates
      ? entryDates.split(",")
      : [];

    let policy;

    // If ID is provided, add data to an existing policy
    if (_id) {
      const updates = {};

      // Add new data to the existing arrays
      if (entryDatesArray.length > 0)
        updates.entryDate = { $push: { $each: entryDatesArray } };
      if (issueDatesArray.length > 0)
        updates.issueDate = { $push: { $each: issueDatesArray } };
      if (expiryDatesArray.length > 0)
        updates.expiryDate = { $push: { $each: expiryDatesArray } };
      if (policyAmountsArray.length > 0)
        updates.policyAmount = { $push: { $each: policyAmountsArray } };
      if (clientName) updates.clientName = clientName;
      if (companyNameArray.length > 0)
        updates.companyName = { $push: { $each: companyNameArray } }; // Ensure $push with $each for array
      if (mainCategory) updates.mainCategory = mainCategory;
      if (subCategory) updates.subCategory = subCategory;
      if (policyAttachments.length > 0)
        updates.policyAttachment = { $push: { $each: policyAttachments } };

      // Add data to the existing policy or create a new one
      policy = await Policy.findByIdAndUpdate(_id, updates, {
        new: true,
        runValidators: true,
        upsert: true, // This will create the policy if it doesn't exist
      });

      return res
        .status(200)
        .json({ message: "Policy added successfully", policy });
    }

    // If no ID is provided, create a new policy
    policy = await Policy.create({
      clientName,
      companyName: companyNameArray, // This can be an array of company ObjectIds
      mainCategory,
      subCategory,
      entryDate: entryDatesArray,
      issueDate: issueDatesArray,
      expiryDate: expiryDatesArray,
      policyAmount: policyAmountsArray,
      policyAttachment: policyAttachments,
    });

    return res
      .status(201)
      .json({ message: "Policy created successfully", policy });
  } catch (error) {
    console.error("Error processing policy:", error);
    return res
      .status(500)
      .json({ message: "Error processing policy", error: error.message });
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
    const { id } = req.params; // Get policy ID from the request URL
    const policy = await Policy.findByIdAndDelete(id); // Delete the policy by ID

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" }); // If no policy is found with the provided ID
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

module.exports = {
  addPolicy,
  getAllPolicies,
  getPolicyById,
  deletePolicy,
};
