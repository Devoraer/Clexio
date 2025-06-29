// 📁 convertCalibrationDates.js – המרת תאריכי Calibration ממחרוזת ל־Timestamp

const { db } = require("./firebase");
const admin = require("firebase-admin");
const dayjs = require("dayjs");

const collectionName = "Machines";

const runConversion = async () => {
  console.log("🚀 מריצים המרת תאריכים באוסף:", collectionName);

  try {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();

    let updatedCount = 0;
    let skippedCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const docRef = db.collection(collectionName).doc(doc.id);
      const rawDate = data["Calibration Date"];

      // ⏩ אם זה כבר Timestamp – לא נוגעים
      if (typeof rawDate === "object" && typeof rawDate.toDate === "function") {
        console.log(`⏩ ${doc.id} כבר עם Timestamp – מדלגים`);
        skippedCount++;
        return;
      }

      if (typeof rawDate === "string") {
        const parsed = dayjs(rawDate, [
          "DD/MM/YYYY",
          "D/M/YYYY",
          "YYYY-MM-DD",
          "MM/DD/YYYY",
          "MMMM D, YYYY",   // לדוגמה: June 26, 2025
        ], true);

        if (parsed.isValid()) {
          const timestamp = admin.firestore.Timestamp.fromDate(parsed.toDate());

          batch.update(docRef, {
            "Calibration Date": timestamp,
          });

          console.log(`✅ ${doc.id} → "${rawDate}" → ${timestamp.toDate().toLocaleDateString()}`);
          updatedCount++;
        } else {
          console.warn(`⚠️ ${doc.id} – מחרוזת תאריך לא תקינה: "${rawDate}"`);
          skippedCount++;
        }
      } else {
        console.warn(`⚠️ ${doc.id} – לא מחרוזת ולא Timestamp – מדלגים`);
        skippedCount++;
      }
    });

    await batch.commit();
    console.log("\n🎉 סיום:");
    console.log(`🛠️ תוקנו: ${updatedCount}`);
    console.log(`📦 דילגנו על: ${skippedCount}`);
  } catch (err) {
    console.error("❌ שגיאה כללית:", err);
  }
};

runConversion();
