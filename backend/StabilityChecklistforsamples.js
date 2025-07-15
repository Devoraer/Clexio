// 📁 backend/StabilityChecklistforsamples.js

const express = require("express");
const router = express.Router();
const { db } = require("./firebase");

// 🔍 שליפת Stability Checklist לפי ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const querySnapshot = await db
      .collection("StabilityChecklist")
      .where("ID", "==", parseInt(id))
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send("Checklist not found");
    }

    const doc = querySnapshot.docs[0];
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("❌ שגיאה בשליפת Checklist לפי ID:", error);
    res.status(500).send("שגיאה בשליפת checklist");
  }
});

// ✅ שליפת ID חדש מתוך IdCounters/StabilityID
// ✅ שליפת ID חדש – חייב לבוא לפני
router.get("/next-id", async (req, res) => {
  try {
    const counterRef = db.collection("IdCounters").doc("StabilityID");
    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(counterRef);
      const current = doc.exists ? parseInt(doc.data().nextId) : 1;
      const next = current + 1;
      t.update(counterRef, { nextId: next });
      return current;
    });

    res.status(200).json({ nextId: result });
  } catch (err) {
    console.error("❌ Failed to fetch next ID:", err);
    res.status(500).send({ error: "Failed to get next stability checklist ID" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const querySnapshot = await db
      .collection("StabilityChecklist")
      .where("ID", "==", parseInt(id))
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send("Checklist not found");
    }

    const doc = querySnapshot.docs[0];
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(" שגיאה בשליפת Checklist לפי ID:", error);
    res.status(500).send("שגיאה בשליפת checklist");
  }
});

// 🔸 POST: הוספת Stability Checklist חדשה
router.post("/add", async (req, res) => {
  try {
    const data = req.body;

    if (!data.ID) {
      return res.status(400).send("Missing ID");
    }

    await db.collection("StabilityChecklist")
      .doc(data.ID.toString())
      .set(data);

    res.status(200).send("Stability checklist saved successfully.");
  } catch (error) {
    console.error("Error saving checklist:", error);
    res.status(500).send("Error saving checklist: " + error.message);
  }
});

// ✏️ PUT: עדכון Stability Checklist קיים לפי ID
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const docRef = db.collection("StabilityChecklist").doc(id.toString());
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send("Checklist not found");
    }

    await docRef.update(data);
    res.status(200).send("Checklist updated successfully.");
  } catch (error) {
    console.error("❌ Error updating checklist:", error);
    res.status(500).send("Error updating checklist: " + error.message);
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
