const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const csv = require('csv-parser'); 
const fs = require('fs');         
const path = require('path');
const app = express();

const port = 3000;

const serviceAccount = require('./clexio-data-base-firebase-adminsdk-fbsvc-d30f311329.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'clexio-data-base',
});

const db = admin.firestore();

app.use(bodyParser.json());

app.use('/test_front', express.static(path.join(__dirname, 'test_front')));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '/test_front/html/front.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Failed to send file:", err);
      res.status(500).send("Error loading page");
    }
  });
});

app.get('/send_to_data_anayles', (req, res) => {
  const filePath = path.join(__dirname, '/test_front/html/data_anayles.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Failed to send file:", err);
      res.status(500).send("Error loading page");
    }
  });
});

app.get('/eli', (req, res) => {
  console.log("Eliiiiiiiiiiiiii");
  res.send('🎉 Eli is the King, and lea copy all from gpt');
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

app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
