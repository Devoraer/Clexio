// 📁 index.js

const express = require("express");
const cors = require("cors");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { db } = require("./firebase");

const app = express();
const port = 3000;

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 🛠️ Routers
const materialsRouter = require("./materials");
const samplesRouter = require("./samples");
const machinesRouter = require("./machines");
const stabilityChecklistRouter = require("./StabilityChecklistforsamples");
const rawRouter = require("./raw");
const alertsRouter = require("./alerts");
const projectsRouter = require('./projects');

// ✅ חיבור כל הראוטרים
app.use("/api/materials", materialsRouter);
app.use("/api/samples", samplesRouter);
app.use("/api/machines", machinesRouter);
app.use("/api/stability-checklist", stabilityChecklistRouter);
app.use("/api/raw", rawRouter);
app.use("/api/alerts", alertsRouter);
app.use('/api/projects', projectsRouter);
app.use("/api/garbage", require("./garbage"));


// ✅ חיבור ה־alertsRouter
try {
  console.log("✅ alertsRouter loaded");
} catch (err) {
  console.error("❌ Failed to load alertsRouter:", err.message);
}

// 🔔 בדיקת תקשורת כללית
app.get("/api/ping", (req, res) => {
  res.send({ message: "pong" });
});

// 📦 טעינת CSV
app.post("/api/upload-csv", async (req, res) => {
  const collectionName = "Materials";
  const csvFilePath = path.join(__dirname, "Materials_csv.csv");

  let rowsProcessed = 0;
  let responseSent = false;

  try {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", async (row) => {
        try {
          await db.collection(collectionName).doc(row["ID"]).set(row);
          rowsProcessed++;
        } catch (error) {
          console.error("Error saving row:", row, error);
        }
      })
      .on("end", () => {
        if (!responseSent) {
          responseSent = true;
          console.log(`${rowsProcessed} rows loaded`);
          res.status(200).send({ result: `CSV uploaded (${rowsProcessed} rows)` });
        }
      })
      .on("error", (error) => {
        if (!responseSent) {
          responseSent = true;
          console.error("CSV read error:", error);
          res.status(500).send({ error: "CSV read error" });
        }
      });
  } catch (error) {
    if (!responseSent) {
      responseSent = true;
      console.error("General error:", error);
      res.status(500).send({ error: "Failed to load file" });
    }
  }
});

// 🌐 ברירת מחדל
app.get("/", (req, res) => {
  res.send("Clexio API is running! 🧪🚀");
});

// ▶️ הפעלת השרת
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
