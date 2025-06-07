const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Make sure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});
const upload = multer({ storage });

// In-memory store
const db = {};

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/product/:productId/step", upload.single("file"), (req, res) => {
  const { productId } = req.params;
  const { supplierName, location, type, riskScore } = req.body;
  const file = req.file;

  if (!supplierName || !location || !type || !riskScore || !file) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const step = {
    supplierName,
    location,
    type,
    riskScore: parseInt(riskScore),
    file: file.filename,
    time: new Date(),
  };

  if (!db[productId]) db[productId] = [];
  db[productId].push(step);

  res.json({ message: "Step added!", step });
});

app.get("/product/:productId", (req, res) => {
  const steps = db[req.params.productId] || [];
  res.json({ steps });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

