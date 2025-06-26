// 📁 backend/StabilityChecklistforsamples.js

const express = require("express");
const router = express.Router();
const { db } = require("./firebase");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// 🧮 פונקציה שמביאה ID רץ
const getNextId = async () => {
  const counterRef = db.collection("Meta").doc("stabilityIdCounter");
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(counterRef);
    const current = doc.exists ? doc.data().value : 5000;
    const next = current + 1;
    t.set(counterRef, { value: next });
    return next;
  });
  return result;
};

// ✅ מספק ID רץ לפרונט
router.get("/next-id", async (req, res) => {
  try {
    const nextId = await getNextId();
    res.status(200).send({ nextID: nextId });
  } catch (error) {
    console.error("❌ שגיאה בקבלת ID חדש:", error);
    res.status(500).send({ error: "שגיאה בקבלת ID חדש" });
  }
});

// 🔍 שליפת כל הדגימות
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("StabilityChecklist").get();
    const items = snapshot.docs.map(doc => ({ ID: doc.id, ...doc.data() }));
    res.status(200).send(items);
  } catch (error) {
    console.error("❌ שגיאה בשליפת StabilityChecklist:", error);
    res.status(500).send({ error: "שגיאה בשליפה" });
  }
});

// 📊 סיכום כללי
router.get("/summary", async (req, res) => {
  try {
    const snapshot = await db.collection("StabilityChecklist").get();
    const now = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(now.getDate() + 10);

    let total = 0;
    let expiringSoon = 0;

    snapshot.forEach(doc => {
      total++;
      const data = doc.data();
      const expField = data.expirationDate || data["Expiry Date"];

      if (expField) {
        try {
          const [day, month, year] = expField.split("/");
          const expDate = new Date(`${year}-${month}-${day}`);
          if (expDate >= now && expDate <= tenDaysFromNow) {
            expiringSoon++;
          }
        } catch {
          console.warn("❗ תאריך לא תקין:", expField);
        }
      }
    });

    res.status(200).send({ total, expiringSoon });
  } catch (error) {
    console.error("❌ שגיאה בסיכום:", error);
    res.status(500).send({ error: "שגיאה בסיכום" });
  }
});

// 🔍 שליפה לפי ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("StabilityChecklist").doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ error: "לא נמצא" });
    }
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("❌ שגיאה בשליפה בודדת:", error);
    res.status(500).send({ error: "שגיאה בשליפה" });
  }
});

// ✏️ עדכון שדה מסוים (amount או status)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.collection("StabilityChecklist").doc(id).update(updates);
    res.status(200).send({ message: "עודכן בהצלחה" });
  } catch (error) {
    console.error("❌ שגיאה בעדכון:", error);
    res.status(500).send({ error: "שגיאה בעדכון" });
  }
});

// ➕ הוספת דגימה חדשה
router.post("/", async (req, res) => {
  try {
    const {
      name,
      expirationDate,
      type,
      location,
      project,
      status
    } = req.body;

    if (!name || !expirationDate) {
      return res.status(400).send({ error: "שדות חובה חסרים" });
    }

    const newId = (await getNextId()).toString();

    const newEntry = {
      ID: newId,
      Name: name,
      "Expiry Date": expirationDate,
      Type: type,
      Location: location,
      Project: project,
      Status: status
    };

    await db.collection("StabilityChecklist").doc(newId).set(newEntry);
    res.status(201).send({ message: "נוסף בהצלחה", id: newId });
  } catch (error) {
    console.error("❌ שגיאה בהוספה:", error);
    res.status(500).send({ error: "שגיאה בהוספה" });
  }
});

// 📤 העלאת CSV
router.post("/upload-stability-csv", async (req, res) => {
const csvFilePath = path.join(__dirname, "../resources/StabilityChecklistforsamples.csv");

  try {
    let rowsProcessed = 0;

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", async (row) => {
        try {
          const id = row["ID"] || row["id"] || row["Id"] || (await getNextId()).toString();
          await db.collection("StabilityChecklist").doc(id).set(row);
          rowsProcessed++;
        } catch (error) {
          console.error("❌ שגיאה בשורה:", row, error);
        }
      })
      .on("end", () => {
        console.log(`✅ StabilityChecklist נטען: ${rowsProcessed} שורות`);
        res.status(200).send({ result: `CSV נטען בהצלחה (${rowsProcessed} שורות)` });
      })
      .on("error", (error) => {
        console.error("❌ שגיאה בקריאת CSV:", error);
        res.status(500).send({ error: "שגיאה בקריאת הקובץ" });
      });
  } catch (error) {
    console.error("❌ שגיאה כללית:", error);
    res.status(500).send({ error: "שגיאה בהעלאה" });
  }
});

module.exports = router;
