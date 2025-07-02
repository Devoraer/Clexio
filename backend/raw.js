// 📁 backend/raw.js

const express = require("express");
const router = express.Router();
const { db } = require("./firebase");

// 🔍 קבלת ה־ID הבא בלי לעדכן אותו
router.get("/materials-preview-id", async (req, res) => {
  try {
    const doc = await db.collection("IdCounters").doc("MaterialsId").get();
    if (!doc.exists) return res.status(404).send({ error: "Counter not found" });

    const { nextId } = doc.data();
    res.status(200).send({ previewId: nextId });
  } catch (err) {
    console.error("❌ Error fetching preview ID:", err);
    res.status(500).send({ error: "Failed to fetch preview ID" });
  }
});

module.exports = router;
