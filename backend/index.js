// ייבוא ספריות
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

//  אתחול Firebase
const serviceAccount = require('./clexio-data-base-firebase-adminsdk-fbsvc-c8ad3d3418.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'clexio-data-base',
});

const db = admin.firestore();

//  Middleware
app.use(bodyParser.json());

// דוגמה ל־API פשוט לבדיקת תקשורת
app.get('/api/ping', (req, res) => {
  res.send({ message: 'pong 🏓' });
});

//  שליחת קובץ CSV ל־Firestore
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

app.get('/api/machines', async (req, res) => {
  try {
    console.log("📡 התקבלה בקשה ל־/api/machines");

    const snapshot = await db.collection('Machines').get();
    const machines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("✅ מספר מכונות שנשלפו:", machines.length);
    res.send(machines);
  } catch (error) {
    console.error('❌ שגיאה אמיתית בשליפת מכונות:', error); // 🟢 זה מה שחשוב עכשיו!
    res.status(500).send({ error: 'Failed to fetch machines' });
  }
});


app.get("/", (req, res) => {
  res.send(" Clexio API is running!");
});



//  הרצת השרת
app.listen(port, () => {
  console.log(` Server listening at http://localhost:${port}`);
});


