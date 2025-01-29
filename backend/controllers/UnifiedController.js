const UnifiedModel = require("../Models/Unified Model");

// Add a new record (Client, Agent, or User)
const addEntity = async (req, res) => {
  try {
    const {
      role,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      streetAddress,
      state,
      city,
      area,
      zip,
    } = req.body;

    // Validate role
    if (!role || !["client", "agent", "user"].includes(role)) {
      return res.status(400).json({
        message:
          "Invalid role. Allowed values are 'client', 'agent', or 'user'.",
      });
    }

    // Validate required fields for each role
    if (role === "user" && !password) {
      return res
        .status(400)
        .json({ message: "Password is required for user role." });
    }

    if (
      ["client", "agent"].includes(role) &&
      (!req.files || !req.files.aadharCard || !req.files.pan)
    ) {
      return res.status(400).json({
        message: "Aadhar Card and PAN are required for client and agent roles.",
      });
    }

    const newEntity = new UnifiedModel({
      ...req.body,
      aadharCard: req.files?.aadharCard
        ? `/uploads/${req.files.aadharCard[0].filename}`
        : undefined,
      pan: req.files?.pan ? `/uploads/${req.files.pan[0].filename}` : undefined,
      otherDocuments: req.files?.otherDocuments
        ? req.files.otherDocuments.map((file) => `/uploads/${file.filename}`)
        : [],
    });

    await newEntity.save();
    res.status(201).json({ message: `${role} added successfully`, newEntity });
  } catch (error) {
    console.error("Error adding entity:", error);
    res.status(500).json({ message: "Error adding entity" });
  }
};

// Fetch all records filtered by role
const getAllEntities = async (req, res) => {
  try {
    const { role } = req.query; // Example: /entities?role=client
    const filter = role ? { role } : {};
    const entities = await UnifiedModel.find(filter);
    res.status(200).json(entities);
  } catch (error) {
    console.error("Error fetching entities:", error);
    res.status(500).json({ message: "Error fetching entities" });
  }
};

// Fetch a single record by ID
const getEntityById = async (req, res) => {
  try {
    const { id } = req.params;
    const entity = await UnifiedModel.findById(id);
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }
    res.status(200).json(entity);
  } catch (error) {
    console.error("Error fetching entity by ID:", error);
    res.status(500).json({ message: "Error fetching entity" });
  }
};

// Update a record by ID
const updateEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.files) {
      if (req.files.aadharCard) {
        updates.aadharCard = `/uploads/${req.files.aadharCard[0].filename}`;
      }
      if (req.files.pan) {
        updates.pan = `/uploads/${req.files.pan[0].filename}`;
      }
      if (req.files.otherDocuments) {
        updates.otherDocuments = req.files.otherDocuments.map(
          (file) => `/uploads/${file.filename}`
        );
      }
    }

    const updatedEntity = await UnifiedModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedEntity) {
      return res.status(404).json({ message: "Entity not found" });
    }
    res
      .status(200)
      .json({ message: "Entity updated successfully", updatedEntity });
  } catch (error) {
    console.error("Error updating entity:", error);
    res.status(500).json({ message: "Error updating entity" });
  }
};

// Delete a record by ID
const deleteEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const entity = await UnifiedModel.findByIdAndDelete(id);
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }
    res.status(200).json({ message: "Entity deleted successfully", entity });
  } catch (error) {
    console.error("Error deleting entity:", error);
    res.status(500).json({ message: "Error deleting entity" });
  }
};

module.exports = {
  addEntity,
  getAllEntities,
  getEntityById,
  updateEntity,
  deleteEntity,
};
