// 📁 backend/machine.js
const express = require("express");
const { db } = require("./firebase");
const admin = require("firebase-admin");
const dayjs = require("dayjs");

const machinesRouter = express.Router();
const collectionName = "Machines";

//
// 🔢 שליפת מזהה ID הבא
//
machinesRouter.get("/next-id", async (req, res) => {
  try {
    const counterRef = db.collection("IdCounters").doc("MachinesId");
    const counterDoc = await counterRef.get();
    const currentId = counterDoc.exists ? counterDoc.data().nextId : 1;
    res.status(200).send(currentId.toString());
  } catch (err) {
    console.error("Failed to fetch next ID:", err);
    res.status(500).send({ error: "Failed to get next machine ID" });
  }
});

//
// 📋 שליפת כל המכונות עם תאריכים מעוצבים
//
machinesRouter.get("/all", async (req, res) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const result = snapshot.docs.map((doc) => {
      const data = doc.data();

      const formatDate = (raw) => {
        if (typeof raw === "object" && typeof raw.toDate === "function") {
          return dayjs(raw.toDate()).format("DD/MM/YYYY");
        } else if (typeof raw === "string") {
          const parsed = dayjs(raw, ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD"], true);
          return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "Invalid";
        }
        return "Invalid";
      };

      return {
        ID: doc.id,
        ...data,
        "Calibration Date": formatDate(data["Calibration Date"]),
        "Next Calibration": formatDate(data["Next Calibration"]),
        CalibrationHistory: data.CalibrationHistory || [],
      };
    });

    res.status(result.length ? 200 : 204).send(result);
  } catch (error) {
    console.error("Failed to fetch machines:", error);
    res.status(500).send({ error: "Failed to fetch machines" });
  }
});

//
// 🔍 שליפת מכונה לפי ID
//
machinesRouter.get("/info/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.collection(collectionName).doc(id).get();
    const data = result.data();
    if (data) res.status(200).send(data);
    else res.status(204).send();
  } catch (error) {
    console.error("Failed to fetch machine info:", error);
    res.status(500).send({ error: "Failed to fetch machine info" });
  }
});

//
// 📊 סיכום: כמות מכונות + פגי תוקף
//
machinesRouter.get("/summary", async (req, res) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const all = snapshot.docs.map((doc) => doc.data());

    let total = 0;
    let overdue = 0;
    const today = dayjs();

    all.forEach((machine) => {
      const calDateRaw = machine["Calibration Date"];
      const intervalRaw = machine["Calibration interval"];
      if (!calDateRaw || !intervalRaw) return;

      const interval = parseInt(intervalRaw.toLowerCase().replace("m", ""));
      let baseDate = dayjs(null); // ✅ תקין

      if (typeof calDateRaw === "object" && typeof calDateRaw.toDate === "function") {
        baseDate = dayjs(calDateRaw.toDate());
      } else if (typeof calDateRaw === "string") {
        baseDate = dayjs(calDateRaw, ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD"], true);
      }

      if (!baseDate.isValid()) return;

      const nextCal = baseDate.add(interval, "month");
      total++;
      if (nextCal.isBefore(today)) overdue++;
    });

    res.status(200).send({ total, overdue });
  } catch (error) {
    console.error("Error in /summary:", error);
    res.status(500).send({ error: "Failed to calculate summary" });
  }
});

//
// ✏️ עדכון מכונה לפי ID
//
machinesRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const docRef = db.collection(collectionName).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return res.status(404).send({ error: `Machine with ID ${id} not found` });
    }

    const docData = existing.data();
    const updatedData = {};

    // 🗓️ תאריך כיול
    const newDate = body["Calibration Date"] || body.calibrationDate;
    if (newDate) {
      const parsed = dayjs(newDate, ["YYYY-MM-DD", "DD/MM/YYYY", "D/M/YYYY"], true);
      if (parsed.isValid()) {
        updatedData["Calibration Date"] = admin.firestore.Timestamp.fromDate(parsed.toDate());
      } else {
        return res.status(400).send({ error: "Invalid date format provided" });
      }
    }

    // 🔁 אינטרוול
    const newInterval =
      body["Calibration interval"] || body.calibrationInterval || docData["Calibration interval"];
    if (newInterval) {
      updatedData["Calibration interval"] = String(newInterval);
    }

    // 🗓️ תאריך הכיול הבא
    const newNextCalibration = body["Next Calibration"] || body.nextCalibration;
    if (newNextCalibration) {
      const parsed = dayjs(newNextCalibration, ["YYYY-MM-DD", "DD/MM/YYYY", "D/M/YYYY"], true);
      if (parsed.isValid()) {
        updatedData["Next Calibration"] = admin.firestore.Timestamp.fromDate(parsed.toDate());
      } else {
        return res.status(400).send({ error: "Invalid next calibration date format" });
      }
    }

    // 🧾 היסטוריה
    const CalibrationHistory = docData.CalibrationHistory || [];
    CalibrationHistory.push({
      date: admin.firestore.Timestamp.now(),
      interval: newInterval,
      updatedBy: body.updatedBy || "System",
      timestamp: dayjs().unix(),
    });

    updatedData.CalibrationHistory = CalibrationHistory;

    await docRef.update(updatedData);
    res.status(200).send({
      message: `Machine with ID ${id} updated successfully`,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating machine:", error);
    res.status(500).send({ error: "Failed to update machine" });
  }
});

//
// ➕ הוספת מכונה חדשה
//
machinesRouter.post("/", async (req, res) => {
  try {
    const machine = req.body;
    const id = String(machine.ID);

    if (!id || !machine["Instrument ID"] || !machine["Calibration interval"]) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // 🗓️ תאריך כיול
    let calibrationDate = machine["Calibration Date"];
    if (typeof calibrationDate === "string") {
      const parsed = dayjs(calibrationDate, ["YYYY-MM-DD", "DD/MM/YYYY", "D/M/YYYY"], true);
      if (!parsed.isValid()) {
        return res.status(400).send({ error: "Invalid Calibration Date format" });
      }
      calibrationDate = admin.firestore.Timestamp.fromDate(parsed.toDate());
    } else if (
      calibrationDate &&
      typeof calibrationDate === "object" &&
      typeof calibrationDate.toDate === "function"
    ) {
      // כבר תקין
    } else {
      return res.status(400).send({ error: "Calibration Date is missing or invalid" });
    }

    // 🗓️ חישוב תאריך הכיול הבא
    let nextCalibration = null;
    if (calibrationDate && machine["Calibration interval"]) {
      const months = parseInt(
        String(machine["Calibration interval"]).toLowerCase().replace("m", "")
      );
      const next = dayjs(calibrationDate.toDate()).add(months, "month");
      nextCalibration = admin.firestore.Timestamp.fromDate(next.toDate());
    }

    // ✨ יצירת המסמך
    const newMachine = {
      ...machine,
      "Calibration Date": calibrationDate,
      "Next Calibration": nextCalibration,
      createdAt: admin.firestore.Timestamp.now(),
      CalibrationHistory: [
        {
          date: calibrationDate,
          interval: machine["Calibration interval"],
          updatedBy: machine.updatedBy || "System",
          timestamp: dayjs().unix(),
        },
      ],
    };

    await db.collection(collectionName).doc(id).set(newMachine);
    await db.collection("IdCounters").doc("MachinesId").update({
      nextId: admin.firestore.FieldValue.increment(1),
    });

    res.status(201).send({
      message: `Machine ${id} created successfully`,
      machine: newMachine,
    });
  } catch (err) {
    console.error("Failed to add machine:", err);
    res.status(500).send({ error: "Failed to add machine" });
  }
});

//
// 📦 ייצוא ה־Router
//
module.exports = machinesRouter;
