// 📁 backend/materials.js

const express = require("express");
const router = express.Router();
const { db } = require("./firebase");
const fs = require("fs");
const path = require("path");

// ✅ שליפת ID חדש מתוך IdCounters/MaterialsId (ומיד עדכון הבא)
const getNextId = async () => {
  const counterRef = db.collection("IdCounters").doc("MaterialsId");
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(counterRef);
    const current = doc.exists ? doc.data().nextId : 1;
    const next = current + 1;
    t.update(counterRef, { nextId: next });
    return current;
  });
  return result;
};

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("Materials").get();
    const materials = snapshot.docs.map((doc) => ({
      ...doc.data(),
      ID: doc.data().ID || doc.id, // 📌 ודאות להצגת ID
    }));
    res.status(200).send(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).send({ error: "Error fetching materials" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const snapshot = await db.collection("Materials").get();
    const now = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(now.getDate() + 10);

    let total = 0;
    let expiringSoon = 0;
    let totalQuantity = 0;
    let lowQuantity = 0;

    snapshot.forEach((doc) => {
      total++;
      const data = doc.data();
      const expField = data.expirationDate || data["Expiry Date"];

      const quantity = data.quantity || data.Quantity || data.amount || data.Amount;
      const numericQty = typeof quantity === "number" ? quantity : parseFloat(quantity);

      if (!isNaN(numericQty)) {
        totalQuantity += numericQty;
        if (numericQty < 50) {
          lowQuantity++;
        }
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
          console.warn("⚠️ Invalid expiration date format:", expField);
        }
      }
    });

    res.status(200).send({
      total,
      expiringSoon,
      lowQuantity,
      totalQuantity,
    });
  } catch (error) {
    console.error("❌ Error calculating summary:", error);
    res.status(500).send({ error: "Error calculating summary" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("Materials").doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ error: "Material not found" });
    }
    const material = { id: doc.id, ...doc.data() };
    res.status(200).send(material);
  } catch (error) {
    console.error("Error fetching material:", error);
    res.status(500).send({ error: "Error fetching material" });
  }
});

router.put("/:id/quantity", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (typeof quantity !== "number") {
      return res.status(400).send({ error: "Quantity must be a number" });
    }

    await db.collection("Materials").doc(id).update({ quantity });

    const snapshot = await db.collection("Materials").get();
    const materials = snapshot.docs.map((doc) => doc.data());

    if (materials.length === 0) {
      return res.status(200).send({ message: "Quantity updated but no materials to export" });
    }

    const csvHeader = Object.keys(materials[0]).join(",") + "\n";
    const csvRows = materials.map((mat) =>
      Object.values(mat).map((value) => `"${value}"`).join(",")
    );
    const csvContent = csvHeader + csvRows.join("\n");

    fs.writeFileSync(path.join(__dirname, "Materials_csv.csv"), csvContent, "utf8");

    res.status(200).send({ message: "Quantity updated and CSV saved" });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).send({ error: "Failed to update quantity" });
  }
});

router.put("/:id/amount", async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    if (typeof amount !== "number") {
      return res.status(400).send({ error: "Amount must be a number" });
    }

    await db.collection("Materials").doc(id).update({ Amount: amount });

    res.status(200).send({ message: "Amount updated successfully" });
  } catch (error) {
    console.error("Error updating amount:", error);
    res.status(500).send({ error: "Failed to update amount" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      Tradename, Amount, Unit, Location, Lot, Vendor,
      "CAS Number": casNumber, MSDS, CoA, No, "Expiry Date": expiry
    } = req.body;

    const newId = (await getNextId()).toString();

    const expiryDate = expiry || new Date(new Date().setMonth(new Date().getMonth() + 6))
      .toLocaleDateString("en-GB"); // 📅 DD/MM/YYYY

    const newMaterial = {
      ID: newId,
      Tradename,
      Amount,
      Unit,
      Location,
      Lot,
      Vendor,
      "CAS Number": casNumber,
      MSDS,
      CoA,
      No,
      "Expiry Date": expiryDate,
    };

    await db.collection("Materials").doc(newId).set(newMaterial);

    res.status(201).send({ message: "Material added successfully", id: newId });
  } catch (error) {
    console.error("❌ Error adding material:", error);
    res.status(500).send({ error: "Error adding material" });
  }
});

module.exports = router;
