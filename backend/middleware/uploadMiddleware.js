const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads"; // Ensure this directory exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, extname);
    const filename = `${basename}-${Date.now()}${extname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      // Reject the file with a custom error message
      return cb(
        new Error("Invalid file type. Only PDF, PNG, and JPG are allowed."),
        false
      );
    }
  },
});

const uploadFields = upload.fields([
  { name: "aadharCard", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "otherDocuments", maxCount: 10 },
  { name: "policyAttachment", maxCount: 10 },
]);

module.exports = { uploadFields };
