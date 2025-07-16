const express = require("express");
const router = express.Router();
const { db } = require("./firebase");

router.get("/date", async (req, res) => {
  try {
    const doc = await db.collection("Garbage").doc("Date").get();
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch garbage date." });
  }
});

router.put("/date", async (req, res) => {
  try {
    const { nextDate } = req.body;
    await db.collection("Garbage").doc("Date").set({ nextDate });
    res.json({ message: "Garbage date updated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update garbage date." });
  }
});

module.exports = router;
