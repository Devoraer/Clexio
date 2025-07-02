// 📁 backend/StabilityChecklistforsamples.js

const express = require("express");
const router = express.Router();
const { db } = require("./firebase");

// ✅ שליפת ID חדש מתוך IdCounters/StabilityChecklistId
router.get("/next-id", async (req, res) => {
  try {
    const counterRef = db.collection("IdCounters").doc("StabilityChecklistId");
    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(counterRef);
      const current = doc.exists ? doc.data().nextId : 1;
      const next = current + 1;
      t.update(counterRef, { nextId: next });
      return current;
    });

    res.status(200).send(result.toString());
  } catch (err) {
    console.error("❌ Failed to fetch next ID:", err);
    res.status(500).send({ error: "Failed to get next stability checklist ID" });
  }
});

// 🔸 POST: הוספת Stability Checklist חדשה
router.post("/add", async (req, res) => {
  try {
    const data = req.body;

    // 🛡️ בדיקת שדות חובה
    if (!data.ID || !data.stabilityName || !data.projectName) {
      return res.status(400).send("Missing required fields");
    }

    // 📝 שמירה לפי מזהה מותאם
    await db.collection("StabilityChecklist").doc(data.ID.toString()).set(data);

    res.status(200).send("Stability checklist saved successfully.");
  } catch (error) {
    console.error("Error saving checklist:", error);
    res.status(500).send("Error saving checklist: " + error.message);
  }
});

// 🔹 שליפת כל הטפסים
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("StabilityChecklist").get();

    const checklists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(checklists);
  } catch (error) {
    console.error("Error fetching checklists:", error);
    res.status(500).send("Error fetching checklists: " + error.message);
  }
});

module.exports = router;
