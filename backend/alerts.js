const express = require("express");
const { db } = require("./firebase");
const alertsRouter = express.Router();

alertsRouter.get("/comingSoon", async (req, res) => {
  try {
    const now = new Date();
    const alerts = [];

    const checkExpiryStatus = (dateStr) => {
      try {
        const [day, month, year] = dateStr.split("/").map(Number);
        const expiry = new Date(year, month - 1, day);
        const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "Expired";
        if (diffDays < 30) return "Expiring Soon";
        return "Valid";
      } catch {
        return "Invalid";
      }
    };

    // 🧪 חומרים שתוקפם עומד לפוג בלבד
    const materialsSnap = await db.collection("Materials").get();
    materialsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const rawDate = (data["Expiry Date"] || "").trim();
      const status = checkExpiryStatus(rawDate);

      if (status === "Expiring Soon") {
        alerts.push({
          type: "Material",
          id: doc.id,
          name: data.Tradename || data.name || "Unknown",
          dueDate: rawDate,
          status,
        });
      }
    });

    // 🛠️ מכונות שתוקפן עבר או קרוב
    const machinesSnap = await db.collection("Machines").get();
    machinesSnap.docs.forEach((doc) => {
      const data = doc.data();
      const rawDate = data["Next Calibration"];
      if (!rawDate) return;

      let nextCalibration = null;

      // ✅ תאריך מסוג Firebase Timestamp
      if (typeof rawDate.toDate === "function") {
        nextCalibration = rawDate.toDate();
      }
      // ✅ תאריך מסוג מחרוזת
      else if (typeof rawDate === "string") {
        const [day, month, year] = rawDate.split("/").map(Number);
        nextCalibration = new Date(year, month - 1, day);
      }

      if (!nextCalibration || isNaN(nextCalibration.getTime())) return;

      const diffDays = Math.floor((nextCalibration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        alerts.push({
          type: "Machine",
          id: doc.id,
          name: data["Instrument ID"] || data.ID || "Unknown Machine",
          dueDate: nextCalibration, // ✅ תאריך אמיתי
          status: "Calibration Overdue",
        });
      } else if (diffDays < 10) {
        alerts.push({
          type: "Machine",
          id: doc.id,
          name: data["Instrument ID"] || data.ID || "Unknown Machine",
          dueDate: nextCalibration, // ✅ תאריך אמיתי
          status: "Calibration Due Soon",
        });
      }
    });

    res.status(200).json(alerts);
  } catch (err) {
    console.error("❌ Error fetching alerts:", err.message);
    res.status(500).send({ error: "Failed to fetch alerts" });
  }
});

module.exports = alertsRouter;
