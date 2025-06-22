const express = require("express");
const router = express.Router();
const { db } = require("./firebase");
const fs = require("fs");
const path = require("path");

// שליפת כל החומרים
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("Materials").get();
    const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(materials);
  } catch (error) {
    console.error("שגיאה בשליפת חומרים:", error);
    res.status(500).send({ error: "שגיאה בשליפת החומרים" });
  }
});

// שליפת חומר בודד לפי ID
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
    console.error("שגיאה בשליפת חומר בודד:", error);
    res.status(500).send({ error: "שגיאה בשליפת החומר" });
  }
});

// עדכון כמות של חומר לפי ID כולל עדכון קובץ CSV
router.put("/:id/quantity", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (typeof quantity !== "number") {
      return res.status(400).send({ error: "Quantity must be a number" });
    }

    await db.collection("Materials").doc(id).update({ Quantity: quantity });

    // שליפה מחדש של כל החומרים כדי לעדכן את הקובץ
    const snapshot = await db.collection("Materials").get();
    const materials = snapshot.docs.map(doc => doc.data());

    if (materials.length === 0) {
      return res.status(200).send({ message: "Quantity updated but no materials to save in CSV" });
    }

    const csvHeader = Object.keys(materials[0]).join(",") + "\n";
    const csvRows = materials.map(mat =>
      Object.values(mat).map(value => `"${value}"`).join(",")
    );
    const csvContent = csvHeader + csvRows.join("\n");

    fs.writeFileSync(
      path.join(__dirname, "Materials_csv.csv"),
      csvContent,
      "utf8"
    );

    res.status(200).send({ message: "Quantity updated and CSV saved" });
  } catch (error) {
    console.error("שגיאה בעדכון כמות:", error);
    res.status(500).send({ error: "Failed to update quantity" });
  }
});

// הוספת חומר חדש
router.post("/", async (req, res) => {
  try {
    const material = req.body;

    if (!material || !material.name || !material.expiryDate) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    await db.collection("Materials").add(material);
    res.status(200).send({ message: "חומר נוסף בהצלחה!" });
  } catch (error) {
    console.error("שגיאה בהוספת חומר:", error);
    res.status(500).send({ error: "שגיאה בהוספת חומר" });
  }
});

module.exports = router;
