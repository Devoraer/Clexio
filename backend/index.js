// 📁 backend/index.js

// 📦 ייבוא ספריות
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// 🔌 חיבור ל־Firebase
const { db } = require('./firebase');

// 🧠 יצירת אפליקציית אקספרס
const app = express();
const port = 3000;

// 🛠️ מידלוורים
app.use(cors());
app.use(bodyParser.json());

// 📂 חיבור ל־Routers
const materialsRouter = require('./materials');
const samplesRouter = require('./samples');
app.use("/api/materials", materialsRouter);
app.use("/api/samples", samplesRouter);

// 🔍 בדיקת תקשורת
app.get('/api/ping', (req, res) => {
  res.send({ message: 'pong' });
});

// 📤 טעינת CSV לקולקשן Firestore
app.post('/api/upload-csv', async (req, res) => {
  const collectionName = 'Materials';
  const csvFilePath = path.join(__dirname, 'Materials_csv.csv');

  try {
    let rowsProcessed = 0;

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          await db.collection(collectionName).doc(row["ID"]).set(row);
          rowsProcessed++;
        } catch (error) {
          console.error('❌ שגיאה בשורה:', row, error);
        }
      })
      .on('end', () => {
        console.log(`${rowsProcessed} שורות נטענו ✅`);
        res.status(200).send({ result: `CSV נטען בהצלחה (${rowsProcessed} שורות)` });
      })
      .on('error', (error) => {
        console.error('❌ שגיאה בקריאת CSV:', error);
        res.status(500).send({ error: 'בעיה בקריאת CSV' });
      });
  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
    res.status(500).send({ error: 'כשל בטעינת קובץ' });
  }
});

// ⚙️ שליפת מכונות (לשימוש עתידי)
app.get('/api/machines', async (req, res) => {
  try {
    const snapshot = await db.collection('Machines').get();
    const machines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(machines);
  } catch (error) {
    console.error('❌ שגיאה בשליפת מכונות:', error);
    res.status(500).send({ error: 'שגיאה בשליפת מכונות' });
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
