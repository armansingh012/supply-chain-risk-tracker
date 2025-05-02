const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1️⃣ MongoDB connection string (replace password/db name if needed)
const mongoURI = "mongodb+srv://arman01:Arman01@supplychainapp.lxy0wfk.mongodb.net/?retryWrites=true&w=majority&appName=SupplyChainApp";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// 2️⃣ Schema + Model
const stepSchema = new mongoose.Schema({
  productId: String,
  supplierName: String,
  location: String,
  type: String,
  timestamp: { type: Date, default: Date.now },
  riskScore: Number,
});

const Step = mongoose.model("Step", stepSchema);

// 3️⃣ Risk score logic
function getRiskScore(location, type) {
  if (location.toLowerCase() === "bangladesh" && type.toLowerCase() === "factory") return 80;
  if (location.toLowerCase() === "usa") return 20;
  return 50;
}

// 4️⃣ Add a supply chain step (POST)
app.post("/product/:id/step", async (req, res) => {
  const productId = req.params.id;
  const { supplierName, location, type } = req.body;

  const step = new Step({
    productId,
    supplierName,
    location,
    type,
    riskScore: getRiskScore(location, type),
  });

  await step.save();
  res.json({ message: "Step added", step });
});

// 5️⃣ Get all steps of a product (GET)
app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const steps = await Step.find({ productId });
  res.json({ productId, steps });
});

// 6️⃣ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
