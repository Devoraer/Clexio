const fs = require("fs");
const path = require("path"); // ✅ חובה! אחרת path לא מוגדר
const csv = require("csv-parser");
const { db } = require("./firebase");

const uploadUsers = async () => {
  const collectionName = "Users";
  const csvFilePath = path.join(__dirname, '../resources', 'Users.csv'); // עדכון קל במסלול
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

uploadUsers();
