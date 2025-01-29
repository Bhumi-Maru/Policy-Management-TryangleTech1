const express = require("express");
const {
  addEntity,
  getAllEntities,
  getEntityById,
  updateEntity,
  deleteEntity,
} = require("../controllers/UnifiedController");
const { uploadFields } = require("../middleware/uploadMiddleware");

const unifiedRouter = express.Router();

// Add a new entity
unifiedRouter.post("/entities", uploadFields, addEntity);

// Get all entities (filter by role using query params)
unifiedRouter.get("/entities", getAllEntities);

// Get a single entity by ID
unifiedRouter.get("/entities/:id", getEntityById);

// Update an entity by ID
unifiedRouter.put("/entities/:id", uploadFields, updateEntity);

// Delete an entity by ID
unifiedRouter.delete("/entities/:id", deleteEntity);

module.exports = unifiedRouter;
