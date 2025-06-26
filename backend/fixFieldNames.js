// 📁 fixFieldNames.js

const admin = require("firebase-admin");
const serviceAccount = require("./clexio-data-base-firebase-adminsdk-fbsvc-c8ad3d3418.json"); // ← הכנס כאן את שם הקובץ שלך

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const collectionName = "Machines"; // ← שנה לשם האוסף שלך אם צריך

const runFix = async () => {
  const snapshot = await db.collection(collectionName).get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};

    // 🛠️ שדה בשם שגוי: 'Caibration Date' במקום 'Calibration Date'
    if (data["Caibration Date"]) {
      updates["Calibration Date"] = data["Caibration Date"];
      updates["Caibration Date"] = admin.firestore.FieldValue.delete();
    }

    // 🛠️ אפשר להוסיף עוד תיקונים דומים פה...

    if (Object.keys(updates).length > 0) {
      console.log(`📌 Fixing document ID: ${doc.id}`);
      await db.collection(collectionName).doc(doc.id).update(updates);
    }
  }

  console.log("✅ כל המסמכים תוקנו בעזרת ה'");
};

runFix().catch((err) => {
  console.error("❌ שגיאה במהלך התיקון:", err);
});
