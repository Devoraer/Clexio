// 📦 ייבוא ספריות
const express = require("express");
const router = express.Router();
const { db } = require("./firebase"); // ✅ שימוש ב־db שאותחל מראש

// 🧪 שליפת כל החומרים מה־Firestore
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
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await db.collection("Materials").doc(id).get();

    if (!doc.exists) {
      return res.status(404).send({ error: "החומר לא נמצא" });
    }

    const material = { id: doc.id, ...doc.data() };
    res.status(200).send(material);
  } catch (error) {
    console.error("❌ שגיאה בשליפת חומר בודד:", error);
    res.status(500).send({ error: "שגיאה בשליפת החומר" });
  }
});

module.exports = router;
