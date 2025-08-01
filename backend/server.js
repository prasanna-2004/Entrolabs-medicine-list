const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 5000;

// Setup multer for parsing multipart/form-data (no files handled, just fields)
const upload = multer();

// Enable CORS for all origins (adjust if needed)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Parse urlencoded bodies (for traditional forms)
app.use(express.urlencoded({ extended: true }));

// In-memory data store for medicines
let medicines = [];

/**
 * GET /medicine/list
 * Returns all medicines in the store as JSON array.
 */
app.get("/medicine/list", (req, res) => {
  res.json(medicines);
});

/**
 * POST /medicine/add
 * Accepts medicine data sent as form fields (multipart/form-data).
 */
app.post("/medicine/add", upload.none(), (req, res) => {
  try {
    const newMedicine = req.body;

    // Basic validation: required fields
    const requiredFields = ["name", "manufacturer", "skuType", "skuLabel", "quantity", "price"];
    for (const field of requiredFields) {
      if (!newMedicine[field]) {
        return res.status(400).json({ error: `Field '${field}' is required.` });
      }
    }

    // Optionally, convert number fields to correct types
    newMedicine.quantity = Number(newMedicine.quantity);
    newMedicine.price = Number(newMedicine.price);

    if (isNaN(newMedicine.quantity) || isNaN(newMedicine.price)) {
      return res.status(400).json({ error: "Quantity and price must be valid numbers." });
    }

    // Assign a simple unique ID for each medicine (for frontend merging)
    newMedicine.id = medicines.length > 0 ? medicines[medicines.length - 1].id + 1 : 1;

    medicines.push(newMedicine);

    res.json({ message: "Medicine added successfully", medicine: newMedicine });
  } catch (error) {
    console.error("Error in /medicine/add:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
