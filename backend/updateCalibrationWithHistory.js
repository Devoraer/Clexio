// 📁 backend/scripts/updateCalibrationWithHistory.js

const { db } = require("../firebase");
const admin = require("firebase-admin");
const dayjs = require("dayjs");

/**
 * 🛠️ Update machine calibration date & save history
 * @param {string} machineId - The document ID of the machine
 * @param {string} updatedBy - The name of the person updating (e.g. "Devora")
 */
async function updateCalibrationWithHistory(machineId, updatedBy = "System") {
  try {
    const machineRef = db.collection("Machines").doc(machineId);
    const machineSnap = await machineRef.get();

    if (!machineSnap.exists) {
      console.log("❌ Machine not found:", machineId);
      return;
    }

    const machine = machineSnap.data();
    const today = dayjs();
    const formattedToday = today.format("DD/MM/YYYY");
    const interval = machine["Calibration interval"] || machine.calibrationInterval || "12";

    // 🎯 הוספת ההיסטוריה
    const updateHistory = machine.updateHistory || [];
    updateHistory.push({
      date: machine["Calibration Date"] || machine.calibrationDate || formattedToday,
      interval,
      updatedBy,
      updatedAt: admin.firestore.Timestamp.fromDate(today.toDate())
    });

    // 🔄 עדכון בפועל
    await machineRef.update({
      "Calibration Date": admin.firestore.Timestamp.fromDate(today.toDate()),
      "Calibration interval": interval,
      updateHistory,

      // 🧼 מחיקת שדות לא תקניים אם קיימים
      calibrationDate: admin.firestore.FieldValue.delete(),
      calibrationInterval: admin.firestore.FieldValue.delete()
    });

    console.log("✅ Calibration updated + history saved for:", machineId);
  } catch (err) {
    console.error("❌ Error updating calibration:", err);
  }
}

// 🔁 דוגמה לשימוש:
// updateCalibrationWithHistory("MACHINE_ID_123", "Devora");

module.exports = updateCalibrationWithHistory;
