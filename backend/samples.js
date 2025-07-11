// 📁 backend/samples.js
const express = require("express");
const router = express.Router();
const { db } = require("./firebase");

// 🧮 פונקציה שמביאה את הערך הנוכחי ומגדילה אותו
const getNextId = async () => {
  const counterRef = db.collection("Meta").doc("sampleIdCounter");
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(counterRef);
    const current = doc.exists ? doc.data().value : 1;
    const next = current + 1;
    t.set(counterRef, { value: next });
    return next;
  });
  return result;
};

// 🔍 שליפת כל הדגימות
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("Samples").get();
    const samples = snapshot.docs.map(doc => ({ ID: doc.id, ...doc.data() }));
    res.status(200).send(samples);
  } catch (error) {
    console.error("❌ שגיאה בשליפת דגימות:", error);
    res.status(500).send({ error: "שגיאה בשליפת הדגימות" });
  }
});

// 🔍 שליפת דגימה לפי ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("Samples").doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ error: "Sample not found" });
    }
    const sample = { ID: doc.id, ...doc.data() };
    res.status(200).send(sample);
  } catch (error) {
    console.error("❌ שגיאה בשליפת דגימה בודדת:", error);
    res.status(500).send({ error: "שגיאה בשליפת הדגימה" });
  }
});

// ➕ הוספת דגימה חדשה עם ID שנוצר מהשרת בלבד
router.post("/", async (req, res) => {
  try {
    const {
      clexioNumber,
      comment,
      completedBy,
      completionDate,
      containers,
      dateOfReceipt,
      projectName,
      receivedBy,
      receivedFrom,
      sampleName,
      storage,
      testsRequired
    } = req.body;

    // אימות שדות חובה
    if (!clexioNumber || !dateOfReceipt || !sampleName) {
      return res.status(400).send({ error: "חסרים שדות חובה: clexioNumber, dateOfReceipt, sampleName" });
    }

    // קבלת ID חדש אוטומטי
    const newId = (await getNextId()).toString();

    const newSample = {
      ID: newId,
      clexioNumber,
      comment: comment || "",
      completedBy: completedBy || "",
      completionDate: completionDate || "",
      containers: containers || 0,
      dateOfReceipt,
      projectName: projectName || "",
      receivedBy: receivedBy || "",
      receivedFrom: receivedFrom || "",
      sampleName,
      storage: storage || "",
      testsRequired: testsRequired || ""
    };

    await db.collection("Samples").doc(newId).set(newSample);
    res.status(201).send({ message: "Sample added successfully", id: newId });
  } catch (error) {
    console.error("❌ שגיאה בהוספת דגימה:", error);
    res.status(500).send({ error: "שגיאה בהוספת דגימה" });
  }
});

// ✏️ עדכון הערה לפי ID
router.put("/:id/comment", async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    await db.collection("Samples").doc(id).update({ comment });
    res.status(200).send({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("❌ שגיאה בעדכון הערה:", error);
    res.status(500).send({ error: "שגיאה בעדכון הערה" });
  }
});

// ✅ עדכון completionDate ו-completedBy לפי ID
router.put("/:id/completion", async (req, res) => {
  const { id } = req.params;
  const { completionDate, completedBy } = req.body;

  if (!completionDate && !completedBy) {
    return res.status(400).send({ error: "חובה לציין לפחות completionDate או completedBy" });
  }

  try {
    const updateData = {};

    if (completionDate) {
      // המרת תאריך מ־yyyy-mm-dd ל־dd/mm/yyyy
      if (/^\d{4}-\d{2}-\d{2}$/.test(completionDate)) {
        const [year, month, day] = completionDate.split("-");
        updateData.completionDate = `${day}/${month}/${year}`;
      } else {
        updateData.completionDate = completionDate;
      }
    }

    if (completedBy) {
      updateData.completedBy = completedBy;
    }

    await db.collection("Samples").doc(id).update(updateData);
    res.status(200).send({ message: "Sample completion info updated successfully" });
  } catch (error) {
    console.error("❌ שגיאה בעדכון completion:", error);
    res.status(500).send({ error: "שגיאה בעדכון שדות השלמה" });
  }
});

module.exports = router;
