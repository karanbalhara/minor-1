const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection (Local MongoDB instance, replace with MongoDB Atlas URI if necessary)
mongoose.connect("mongodb://localhost:27017/cipherDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Handle connection errors and success
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// MongoDB Schema for Cipher Comparison
const comparisonSchema = new mongoose.Schema({
  cipher1: String,
  cipher2: String,
  plaintext: String,
  encryptionTime1: { type: Number, required: true },
  decryptionTime1: { type: Number, required: true },
  encryptionTime2: { type: Number, required: true },
  decryptionTime2: { type: Number, required: true },
  comparisonDate: { type: Date, default: Date.now },
});

// Create model based on the schema
const Comparison = mongoose.model("Comparison", comparisonSchema);

// POST route to save comparison data in MongoDB
app.post("/compare", async (req, res) => {
  try {
    const comparisonData = req.body;

    // Ensure all required data is present
    if (!comparisonData.encryptionTime1 || !comparisonData.decryptionTime1 ||
        !comparisonData.encryptionTime2 || !comparisonData.decryptionTime2) {
      return res.status(400).json({ error: "Missing required encryption/decryption times" });
    }

    const newComparison = new Comparison(comparisonData);
    const savedData = await newComparison.save();
    res.status(201).json(savedData); // Respond with the saved data
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
});

// GET route to fetch the comparison history
app.get("/history", async (req, res) => {
  try {
    const history = await Comparison.find().sort({ comparisonDate: -1 });
    res.status(200).json(history); // Send history to the client
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
});

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static('C:/Users/Asus/Desktop/project/cipher-comparison'));

// Start server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
