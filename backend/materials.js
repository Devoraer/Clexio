// ╔═════════════════════════════════════════════════════════════╗
// ║ 📦 Materials API Router (with POST & PUT)                   ║
// ╚═════════════════════════════════════════════════════════════╝

const express = require("express");
const { db } = require("./firebase");
const csv = require("csv-parser");
const fs = require("fs");

const materialsRouter = express.Router();
const collectionName = "Materials";

// ─────────────────────────────────────────────────────────────
// 📥 GET /info/:id – Get specific material
// ─────────────────────────────────────────────────────────────
materialsRouter.get("/info/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.collection(collectionName).doc(id).get();
  const parsedResult = result.data();

  if (parsedResult) res.status(200).send(parsedResult);
  else res.status(204).send();
});

// ─────────────────────────────────────────────────────────────
// 📥 GET /all – Get all materials
// ─────────────────────────────────────────────────────────────
materialsRouter.get("/all", async (req, res) => {
  const result = await (await db.collection(collectionName).get()).docs;
  if (result.length > 0) res.status(200).send(result.map(data => data.data()));
  else res.status(204).send();
});

// ─────────────────────────────────────────────────────────────
// ✏️ POST / – Add a new material
// ─────────────────────────────────────────────────────────────
materialsRouter.post("/", async (req, res) => {
  try {
    const newMaterial = req.body;

    // Make sure there's an ID
    if (!newMaterial.ID) {
      return res.status(400).send({ error: "Material must have an ID field" });
    }

    await db.collection(collectionName).doc(newMaterial.ID).set(newMaterial);
    res.status(201).send({ message: "Material added successfully", data: newMaterial });
  } catch (error) {
    console.error("❌ Error adding material:", error);
    res.status(500).send({ error: "Failed to add material" });
  }
});

// ─────────────────────────────────────────────────────────────
// 🔁 PUT /:id – Update an existing material
// ─────────────────────────────────────────────────────────────
materialsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const docRef = db.collection(collectionName).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return res.status(404).send({ error: `Material with ID ${id} not found` });
    }

    await docRef.update(updatedData);
    res.status(200).send({ message: `Material with ID ${id} updated`, data: updatedData });
  } catch (error) {
    console.error("❌ Error updating material:", error);
    res.status(500).send({ error: "Failed to update material" });
  }
});

// ─────────────────────────────────────────────────────────────
// 🗂️ POST /upload-csv – Upload from CSV
// ─────────────────────────────────────────────────────────────
materialsRouter.post("/upload-csv", async (req, res) => {
  const csvFilePath = "./resources/Mterials_csv.csv"; // Fix name if needed

  try {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", async (row) => {
        try {
          await db.collection(collectionName).doc(row["ID"]).set(row);
          console.log("✅ Document added:", row);
        } catch (error) {
          console.error("❌ Error adding document:", row, error);
        }
      })
      .on("end", () => {
        console.log("✅ CSV file successfully processed");
        res.status(201).send({ result: "CSV file uploaded successfully" });
      })
      .on("error", (error) => {
        console.error("❌ Error reading/parsing CSV:", error);
        res.status(500).send({ error: "Failed to read or parse CSV file" });
      });
  } catch (error) {
    console.error("❌ Error opening CSV file:", error);
    res.status(500).send({ error: "Failed to open CSV file" });
  }
});

// ─────────────────────────────────────────────────────────────
// 🗑️ DELETE /:id – Delete material
// ─────────────────────────────────────────────────────────────
materialsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection(collectionName).doc(id).delete();
    res.status(200).send({ message: `Material with ID ${id} has been deleted` });
  } catch (error) {
    console.error("❌ Error deleting material:", error);
    res.status(500).send({ error: "Failed to delete material" });
  }
});

// ─────────────────────────────────────────────────────────────
// 🚀 Export the router
// ─────────────────────────────────────────────────────────────
module.exports = materialsRouter;
