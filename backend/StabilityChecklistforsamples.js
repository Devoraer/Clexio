// backend/routes/StabilityChecklistforsamples.js

const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

// 🔸 POST: הוספת Stability Checklist חדשה
router.post("/add", async (req, res) => {
  try {
    const data = req.body;

    if (!data.stabilityName || !data.projectName) {
      return res.status(400).send("Missing required fields");
    }

    await db.collection("StabilityChecklist").add(data);

    res.status(200).send("Stability checklist saved successfully.");
  } catch (error) {
    console.error("Error saving checklist:", error);
    res.status(500).send("Error saving checklist: " + error.message);
  }
});

// 🔹 GET: שליפת כל ה-Stability Checklists (לא חובה אבל שימושי אם תבני דשבורד)
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
