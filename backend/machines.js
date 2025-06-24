// 📁 backend/machines.js – Machines API Router (משופר)
const express = require("express");
const { db } = require("./firebase");
const csv = require("csv-parser");
const fs = require("fs");

const machinesRouter = express.Router();
const collectionName = "Machines";

// 🔍 GET /info/:id – Get specific machine
machinesRouter.get("/info/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.collection(collectionName).doc(id).get();
  const parsedResult = result.data();

  if (parsedResult) res.status(200).send(parsedResult);
  else res.status(204).send();
});

// 🔍 GET /all – Get all machines
machinesRouter.get("/all", async (req, res) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const result = snapshot.docs.map(doc => doc.data());

    res.status(result.length ? 200 : 204).send(result);
  } catch (error) {
    console.error("❌ Failed to fetch machines:", error);
    res.status(500).send({ error: "Failed to fetch machines" });
  }
});

// ➕ POST / – Add new machine manually
machinesRouter.post("/", async (req, res) => {
  try {
    const newMachine = req.body;

    if (!newMachine.ID) {
      return res.status(400).send({ error: "Machine must have an ID field" });
    }

    await db.collection(collectionName).doc(newMachine.ID).set(newMachine);
    res.status(201).send({ message: "Machine added successfully", data: newMachine });
  } catch (error) {
    console.error("❌ Error adding machine:", error);
    res.status(500).send({ error: "Failed to add machine" });
  }
});

// 🛠️ PUT /:id – Update machine by ID
machinesRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const docRef = db.collection(collectionName).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return res.status(404).send({ error: `Machine with ID ${id} not found` });
    }

    await docRef.update(updatedData);
    res.status(200).send({ message: `Machine with ID ${id} updated`, data: updatedData });
  } catch (error) {
    console.error("❌ Error updating machine:", error);
    res.status(500).send({ error: "Failed to update machine" });
  }
});

// 📤 POST /upload-csv – Upload machines from CSV file
machinesRouter.post("/upload-csv", async (req, res) => {
  const csvFilePath = "./resources/Machines_Calibration_csv.csv";
  const machines = [];

  try {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        machines.push(row);
      })
      .on("end", async () => {
        try {
          const writeOps = machines.map((machine) =>
            db.collection(collectionName).doc(machine.ID).set(machine)
          );
          await Promise.all(writeOps);
          res.status(201).send({ message: "CSV uploaded successfully", count: machines.length });
        } catch (error) {
          console.error("❌ Failed to write CSV machines:", error);
          res.status(500).send({ error: "Failed to upload CSV machines" });
        }
      })
      .on("error", (error) => {
        console.error("❌ Error reading CSV:", error);
        res.status(500).send({ error: "Failed to read CSV" });
      });
  } catch (error) {
    console.error("❌ Error opening CSV file:", error);
    res.status(500).send({ error: "Failed to open CSV file" });
  }
});

// ❌ DELETE /:id – Delete machine by ID
machinesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection(collectionName).doc(id).delete();
    res.status(200).send({ message: `Machine with ID ${id} has been deleted` });
  } catch (error) {
    console.error("❌ Error deleting machine:", error);
    res.status(500).send({ error: "Failed to delete machine" });
  }
});

// 🚀 Export the router
module.exports = machinesRouter;
