// ╔══════════════════════════════════════════════════╗
// ║ 🚀 Clexio Backend Server                          
// ║ 🌐 Built with Express + Firebase + CSV Uploader  
// ╚══════════════════════════════════════════════════╝

// 🌐 Import needed packages
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const csv = require('csv-parser'); // To read CSV files
const fs = require('fs');          // For reading files
const path = require('path');      // For building file paths

const app = express();
const port = 3000;

// ✅ Initialize Firebase Admin SDK using the service account file
const serviceAccount = require('./clexio-data-base-firebase-adminsdk-fbsvc-d30f311329.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'clexio-data-base',
});

// ✅ Get Firestore database reference
const db = admin.firestore();

// ✅ Use JSON parser for requests
app.use(bodyParser.json());

// ✅ Default route (homepage)
app.get('/', (req, res) => {
  res.send('🎉 Welcome to Clexio Backend! Backend is up and running!');
});

// ✅ Route to upload materials from CSV to Firestore
app.post('/upload-csv', async (req, res) => {
  const collectionName = 'Materials'; // Firestore collection name
  const csvFilePath = path.join(__dirname, 'Materials_csv.csv'); // Path to CSV file

  try {
    let rowsProcessed = 0; // Counter for added rows

    // Read the CSV file and parse it row by row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // Add each row as a document in Firestore (document ID = row["ID"])
          await db.collection(collectionName).doc(row["ID"]).set(row);
          rowsProcessed++;
        } catch (error) {
          console.error('❌ Error adding document:', row, error);
        }
      })
      .on('end', () => {
        // Finished reading CSV
        console.log(`✅ CSV file successfully processed (${rowsProcessed} rows added)`);
        res.status(200).send({ result: `CSV file uploaded successfully (${rowsProcessed} rows)` });
      })
      .on('error', (error) => {
        // Error while reading the CSV
        console.error('❌ Error reading/parsing CSV:', error);
        res.status(500).send({ error: 'Failed to read or parse CSV file' });
      });

  } catch (error) {
    // General error (file doesn't exist, etc.)
    console.error('❌ Error opening CSV file:', error);
    res.status(500).send({ error: 'Failed to open CSV file' });
  }
});

// ✅ Start the server on port 3000
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
