const fs = require("fs");
const csv = require("csv-parser");
const { db } = require("./firebase");
const path = require("path");

const uploadChecklist = async () => {
  const collectionName = "Stability_Checklist";
  const csvFilePath = path.join(__dirname, '../resources', 'Stability_Checklist.csv');
  let rowsProcessed = 0;

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", async (row) => {
      try {
        await db.collection(collectionName).doc(row["ID"]).set(row);
        rowsProcessed++;
      } catch (error) {
        console.error("❌ שגיאה בטעינת שורה:", error);
      }
    })
    .on("end", () => {
      console.log(`✅ ${rowsProcessed} רשומות נטענו ל־${collectionName}`);
    });
};

uploadChecklist();
