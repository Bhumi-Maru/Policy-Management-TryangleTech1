const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Mongo_URL = process.env.MONGO_URL;

if (!Mongo_URL) {
  console.error("Error: MONGO_URL not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(Mongo_URL, {
    connectTimeoutMS: 10000, // Extend the timeout to 10 seconds
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

const db = mongoose.connection;

module.exports = db;
