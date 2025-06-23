// 📁 backend/materials.js
const express = require("express");
const router = express.Router();
const { db } = require("./firebase");
const fs = require("fs");
const path = require("path");

// 🧮 פונקציה שמביאה את הערך הנוכחי ומגדילה אותו
const getNextId = async () => {
  const counterRef = db.collection("Meta").doc("idCounter");
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(counterRef);
    const current = doc.exists ? doc.data().value : 1000;
    const next = current + 1;
    t.set(counterRef, { value: next });
    return next;
  });
  return result;
};

// ✅ מספק ID רץ לפרונט (חובה להוסיף לפני :id!)
router.get("/next-id", async (req, res) => {
  try {
    const nextId = await getNextId();
    res.status(200).send({ nextID: nextId });
  } catch (error) {
    console.error("❌ שגיאה בקבלת ID חדש:", error);
    res.status(500).send({ error: "שגיאה בקבלת ID חדש" });
  }
});

// 🔍 שליפת כל החומרים
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("Materials").get();
    const materials = snapshot.docs.map(doc => ({ ID: doc.id, ...doc.data() }));
    res.status(200).send(materials);
  } catch (error) {
    console.error("❌ שגיאה בשליפת חומרים:", error);
    res.status(500).send({ error: "שגיאה בשליפת החומרים" });
  }
});

// 📊 סיכום כללי
router.get("/summary", async (req, res) => {
  try {
    const snapshot = await db.collection("Materials").get();
    const now = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(now.getDate() + 10);

    let total = 0;
    let expiringSoon = 0;
    let totalQuantity = 0;

    snapshot.forEach(doc => {
      total++;
      const data = doc.data();
      const expField = data.expirationDate || data["Expiry Date"];

      if (typeof data.quantity === "number") {
        totalQuantity += data.quantity;
      }

      if (expField) {
        let expDate;
        try {
          const [day, month, year] = expField.split("/");
          expDate = new Date(`${year}-${month}-${day}`);

          if (expDate >= now && expDate <= tenDaysFromNow) {
            expiringSoon++;
          }
        } catch (err) {
          console.warn("❗ תאריך לא תקין:", expField);
        }
      }
    });

    res.status(200).send({ total, expiringSoon, totalQuantity });
  } catch (error) {
    console.error("❌ שגיאה בסיכום החומרים:", error);
    res.status(500).send({ error: "שגיאה בסיכום החומרים" });
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

// ✏️ עדכון שדה Quantity + יצוא ל־CSV
router.put("/:id/quantity", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (typeof quantity !== "number") {
      return res.status(400).send({ error: "Quantity must be a number" });
    }

    await db.collection("Materials").doc(id).update({ quantity });

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
    console.error("❌ שגיאה בעדכון Quantity:", error);
    res.status(500).send({ error: "Failed to update quantity" });
  }
});

// ✅ עדכון Amount בלבד לפי ID
router.put("/:id/amount", async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    if (typeof amount !== "number") {
      return res.status(400).send({ error: "Amount must be a number" });
    }

    await db.collection("Materials").doc(id).update({ amount });

    res.status(200).send({ message: "Amount updated successfully" });
  } catch (error) {
    console.error("❌ שגיאה בעדכון Amount:", error);
    res.status(500).send({ error: "Failed to update Amount" });
  }
});

/// ➕ הוספת חומר חדש עם ID אוטומטי
router.post("/", async (req, res) => {
  try {
    const {
      name,
      expirationDate,
      amount,
      casNumber,
      coa,
      location,
      lot,
      msds,
      no,
      unit,
      vendor,
      tradename
    } = req.body;

    // בדיקת שדות חובה
    if (!name || !expirationDate) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // קבלת ID חדש רץ
    const newId = (await getNextId()).toString();

    // יצירת חומר חדש עם שדה ID בפנים
    const newMaterial = {
      ID: newId, // ✅ ה-ID גם כשדה בתוך הדאטה!
      Name: name,
      "Expiry Date": expirationDate,
      Amount: amount,
      "CAS Number": casNumber,
      CoA: coa,
      Location: location,
      Lot: lot,
      MSDS: msds,
      No: no,
      Unit: unit,
      Vendor: vendor,
      Tradename: tradename
    };

    // שמירה ב-Firestore לפי ID
    await db.collection("Materials").doc(newId).set(newMaterial);

    res.status(201).send({ message: "חומר נוסף בהצלחה!", id: newId });
  } catch (error) {
    console.error("❌ שגיאה בהוספת חומר:", error);
    res.status(500).send({ error: "שגיאה בהוספת חומר" });
  }
});


module.exports = router;
