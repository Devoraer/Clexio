const express = require("express");
const { db } = require("./firebase");
const dayjs = require("dayjs");

const alertsRouter = express.Router();

alertsRouter.get("/comingSoon", async (req, res) => {
  try {
    const now = dayjs();
    const in7days = now.add(7, "day");

    // 🧪 חומרים שפג תוקפם בקרוב
    const materialsSnap = await db.collection("Materials").get();

    const materials = materialsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((mat) => {
        const rawDate = mat["Expiry Date"];
        if (!rawDate) return false;

        let expiry;
        if (typeof rawDate.toDate === "function") {
          expiry = dayjs(rawDate.toDate());
        } else if (typeof rawDate === "string") {
          expiry = dayjs(rawDate, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]);
        } else {
          return false;
        }

        return expiry.isValid() && expiry.isBefore(in7days);
      })
      .map((mat) => ({
        type: "Material",
        name: mat.Tradename || mat.ID,
        dueDate: dayjs(mat["Expiry Date"]).format("DD/MM/YYYY"),
        status: "פג תוקף בקרוב",
      }));

    // 🛠️ מכונות שדורשות כיול בקרוב
    const machinesSnap = await db.collection("Machines").get();

    const machines = machinesSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((machine) => {
        const rawDate = machine["Calibration Date"];
        if (!rawDate) return false;

        let calibration;
        if (typeof rawDate.toDate === "function") {
          calibration = dayjs(rawDate.toDate());
        } else if (typeof rawDate === "string") {
          calibration = dayjs(rawDate, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]);
        } else {
          return false;
        }

        return calibration.isValid() && calibration.isBefore(in7days);
      })
      .map((machine) => ({
        type: "Machine",
        name: machine["Instrument ID"] || machine.ID,
        dueDate: dayjs(machine["Calibration Date"]).format("DD/MM/YYYY"),
        status: "דורש כיול בקרוב",
      }));

    res.status(200).json([...materials, ...machines]);
  } catch (err) {
    console.error("❌ Error fetching comingSoon alerts:");
    console.error(err.message);
    console.error(err.stack);
    res.status(500).send({ error: "Failed to fetch alerts" });
  }
});

module.exports = alertsRouter;
