// 📁 backend/generateHistory.js

const { db } = require("./firebase");
const admin = require("firebase-admin");
const dayjs = require("dayjs");

const machinesRef = db.collection("Machines");

// 🧠 יוצרת תאריכי הכיול לפי מרווח חודשי, עם עצירה בשנת 2019
function generateHistoryDates(lastCalibrationDate, intervalStr) {
  const dates = [];

  const intervalMonths = parseInt(intervalStr.replace("M", ""));
  if (!intervalMonths || isNaN(intervalMonths)) {
    console.warn("⚠️ interval לא תקין:", intervalStr);
    return dates;
  }

  let date = dayjs(lastCalibrationDate.toDate());

  while (true) {
    date = date.subtract(intervalMonths, "month");
    if (date.year() < 2019) break; // ⛔ עצירה ב־2019

    dates.push({
      date: admin.firestore.Timestamp.fromDate(date.toDate()),
    });
  }

  return dates.reverse(); // ישן -> חדש
}

async function addHistoryToMachines() {
  const snapshot = await machinesRef.get();
  const batch = db.batch();
  let count = 0;

  snapshot.forEach((doc) => {
    const ref = doc.ref;
    const data = doc.data();

    const interval = data["Calibration interval"];
    const lastCalibrationDate = data["Calibration Date"];

    if (!interval || !lastCalibrationDate) {
      console.warn(`⚠️ דילוג על מכונה ${doc.id} – אין interval או Calibration Date`);
      return;
    }

    const existing = Array.isArray(data.CalibrationHistory) ? data.CalibrationHistory : [];

    const newHistory = generateHistoryDates(lastCalibrationDate, interval);
    const fullHistory = [...newHistory, ...existing];

    batch.update(ref, { CalibrationHistory: fullHistory });
    count++;
  });

  await batch.commit();
  console.log(`🎉 היסטוריה ריאליסטית עודכנה ל־${count} מכונות!`);
}

addHistoryToMachines().catch(console.error);
