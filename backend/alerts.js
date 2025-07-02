const express = require("express");
const { db } = require("./firebase");
const dayjs = require("dayjs");

const alertsRouter = express.Router();

alertsRouter.get("/comingSoon", async (req, res) => {
  try {
    const now = dayjs();
    const in10days = dayjs().add(10, "day");
    const in30days = dayjs().add(30, "day");
    const alerts = [];

    // 🧪 חומרים שתוקפם יפוג תוך 30 יום – תאריך בתור מחרוזת "DD/MM/YYYY"
    const materialsSnap = await db.collection("Materials").get();
    materialsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const rawDate = data["Expiry Date"];

      if (!rawDate || typeof rawDate !== "string") return;

      const expiry = dayjs(rawDate, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"], true);

      if (!expiry.isValid()) {
        console.log("❌ תאריך לא תקני לחומר:", data.Tradename || data.ID, rawDate);
        return;
      }

      if (expiry.isAfter(now) && expiry.isBefore(in30days)) {
        alerts.push({
          type: "Material",
          name: data.Tradename || data.ID,
          dueDate: expiry.format("DD/MM/YYYY"),
          status: "Expiring Soon",
        });
      }
    });

    // 🛠️ מכונות שתוקפן עבר או מתקרב תוך 10 ימים
    const machinesSnap = await db.collection("Machines").get();
    machinesSnap.docs.forEach((doc) => {
      const data = doc.data();
      const rawDate = data["Next Calibration"];
      if (!rawDate) return;

      let nextCalibration = null;
      if (typeof rawDate.toDate === "function") {
        nextCalibration = dayjs(rawDate.toDate());
      } else if (typeof rawDate === "string") {
        nextCalibration = dayjs(rawDate, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]);
      }

      if (!nextCalibration || !nextCalibration.isValid()) return;

      if (nextCalibration.isBefore(now)) {
        alerts.push({
          type: "Machine",
          name: data["Instrument ID"] || data.ID,
          dueDate: nextCalibration.format("DD/MM/YYYY"),
          status: "Calibration Overdue",
        });
      } else if (nextCalibration.isBefore(in10days)) {
        alerts.push({
          type: "Machine",
          name: data["Instrument ID"] || data.ID,
          dueDate: nextCalibration.format("DD/MM/YYYY"),
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
