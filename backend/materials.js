const express = require("express");
const router = express.Router();
const { db } = require("./firebase");
const admin = require("firebase-admin");

// 📦 שליפת כל החומרים
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("Materials").get();
    const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(materials);
  } catch (error) {
    console.error("❌ שגיאה בשליפת חומרים:", error);
    res.status(500).send({ error: "שגיאה בשליפת החומרים" });
  }
});

// 🔍 שליפת חומר בודד לפי ID
// ✅ materials.js – נתיב לעדכון כמות (Amount) עם המרה למספר
router.put("/:id/amount", async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const numericAmount = Number(amount); // ✅ המרה בטוחה למספר

  if (isNaN(numericAmount) || numericAmount < 0) {
    return res.status(400).send({ error: "Invalid amount value" });
  }

  try {
    await db.collection("Materials").doc(id).update({
      Amount: numericAmount, // ✅ שמירה כמספר
    });
    res.status(200).send({ success: true, amount: numericAmount });
  } catch (error) {
    console.error("❌ Error updating amount:", error);
    res.status(500).send({ error: "Failed to update amount" });
  }
});


module.exports = router;
