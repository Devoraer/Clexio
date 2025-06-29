// 📁 backend/index.js

// 📦 ייבוא ספריות
const express = require("express");
const cors = require("cors");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

// 🔌 חיבור ל־Firebase
const { db } = require("./firebase");

// 🧠 יצירת אפליקציית אקספרס
const app = express();
const port = 3000;

// 🛠️ מידלוורים
app.use(cors());
app.use(express.json()); // ✅ מודרני יותר מ־bodyParser.json()

// 📂 חיבור ל־Routers
const materialsRouter = require("./materials");
const samplesRouter = require("./samples");
const machinesRouter = require("./machines");
const stabilityChecklistRouter = require("./StabilityChecklistforsamples");

app.use("/api/materials", materialsRouter);
app.use("/api/samples", samplesRouter);
app.use("/api/machines", machinesRouter);
app.use("/api/stability-checklist", stabilityChecklistRouter);

// 🔍 בדיקת תקשורת
app.get("/api/ping", (req, res) => {
  res.send({ message: "pong" });
});

// 📤 טעינת CSV של חומרים
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
          console.error("❌ שגיאה בשורה:", row, error);
        }
      })
      .on("end", () => {
        if (!responseSent) {
          responseSent = true;
          console.log(`${rowsProcessed} שורות נטענו ✅`);
          res
            .status(200)
            .send({ result: `CSV נטען בהצלחה (${rowsProcessed} שורות)` });
        }
      })
      .on("error", (error) => {
        if (!responseSent) {
          responseSent = true;
          console.error("❌ שגיאה בקריאת CSV:", error);
          res.status(500).send({ error: "בעיה בקריאת CSV" });
        }
      });
  } catch (error) {
    if (!responseSent) {
      responseSent = true;
      console.error("❌ שגיאה כללית:", error);
      res.status(500).send({ error: "כשל בטעינת קובץ" });
    }
  }
});

// 🏠 דף הבית
app.get("/", (req, res) => {
  res.send("Clexio API is running! 🧪🚀");
});

// 🚀 הפעלת השרת
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
