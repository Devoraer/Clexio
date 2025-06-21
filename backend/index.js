// 📦 ייבוא ספריות
const express = require('express');
const cors = require('cors'); // ✅ נוספה תמיכה ב־CORS
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { db } = require('./firebase');
const materialsRouter = require('./materials');

const app = express();
const port = 3000;

// ✅ תמיכה ב־CORS כדי ש־Frontend יוכל לדבר עם ה־Backend
app.use(cors());

// 🧠 Middleware
app.use(bodyParser.json());

// 📁 router של חומרי גלם
app.use("/api/materials", materialsRouter);

// 🔄 בדיקת תקשורת פשוטה
app.get('/api/ping', (req, res) => {
  res.send({ message: 'pong 🏓' });
});

// 📤 טעינת CSV לחומרי גלם
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
          console.error('❌ שגיאה בהוספת שורה:', row, error);
        }
      })
      .on('end', () => {
        console.log(`✅ CSV נטען (${rowsProcessed} שורות נוספו)`);
        res.status(200).send({ result: `CSV נטען בהצלחה (${rowsProcessed} שורות)` });
      })
      .on('error', (error) => {
        console.error('❌ שגיאה בקריאת CSV:', error);
        res.status(500).send({ error: 'כשלון בניתוח קובץ CSV' });
      });

  } catch (error) {
    console.error('❌ שגיאה כללית ב־CSV:', error);
    res.status(500).send({ error: 'כשלון בפתיחת קובץ CSV' });
  }
});

// 🤖 שליפת מכונות
app.get('/api/machines', async (req, res) => {
  try {
    console.log("📡 התקבלה בקשה ל־/api/machines");

    const snapshot = await db.collection('Machines').get();
    const machines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("✅ מספר מכונות שנשלפו:", machines.length);
    res.send(machines);
  } catch (error) {
    console.error('❌ שגיאה אמיתית בשליפת מכונות:', error);
    res.status(500).send({ error: 'Failed to fetch machines' });
  }
});

// 🌐 דף הבית הפשוט
app.get("/", (req, res) => {
  res.send("Clexio API is running!");
});

// 🚀 הרצת השרת
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
