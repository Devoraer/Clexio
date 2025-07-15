const express = require("express");
const router = express.Router();
const { db } = require("./firebase");

const getNextId = async () => {
  const counterRef = db.collection("IdCounters").doc("SamplesId");
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(counterRef);
    const current = doc.exists ? parseInt(doc.data().nextId) : 1;
    const next = current + 1;
    t.set(counterRef, { nextId: next.toString() });
    return next;
  });
  return result;
};

router.get("/preview-id", async (req, res) => {
  try {
    const doc = await db.collection("IdCounters").doc("SamplesId").get();
    const current = doc.exists ? parseInt(doc.data().nextId) : 1;
    res.status(200).send(current.toString());
  } catch (error) {
    console.error("❌ שגיאה בשליפת preview id:", error);
    res.status(500).send({ error: "שגיאה בשליפת preview id" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const snapshot = await db.collection("Samples").get();
    const samples = snapshot.docs.map(doc => doc.data());
    res.status(200).send(samples);
  } catch (error) {
    console.error("❌ שגיאה בשליפת כל הדגימות:", error);
    res.status(500).send({ error: "שגיאה בשליפת הדגימות" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const snapshot = await db.collection("Samples").get();

    let inProgress = 0;
    let stabilityInProgress = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (
        !data.completionDate ||
        data.status === "in process" ||
        data.status === "In Progress"
      ) {
        inProgress++;
      }

      if (data.testsRequired === true) {
        stabilityInProgress++;
      }
    });

    res.status(200).json({
      inProgress,
      stabilityInProgress,
    });
  } catch (error) {
    console.error("❌ שגיאה בשליפת summary של דגימות:", error);
    res.status(500).send({ error: "שגיאה בשליפת summary" });
  }
});



router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("Samples").doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ error: "Sample not found" });
    }
    const sample = { ID: doc.id, ...doc.data() };
    res.status(200).send(sample);
  } catch (error) {
    console.error("❌ שגיאה בשליפת דגימה בודדת:", error);
    res.status(500).send({ error: "שגיאה בשליפת הדגימה" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      clexioNumber,
      comment,
      completedBy,
      completionDate,
      containers,
      dateOfReceipt,
      projectName,
      receivedBy,
      receivedFrom,
      sampleName,
      storage,
      testsRequired,
      MachineMade
    } = req.body;

    if (!clexioNumber || !dateOfReceipt || !sampleName) {
      return res.status(400).send({
        error: "חסרים שדות חובה: clexioNumber, dateOfReceipt, sampleName",
      });
    }

    const newId = (await getNextId()).toString();

    const newSample = {
      ID: newId,
      clexioNumber,
      comment: comment ? [{ text: comment, date: new Date().toISOString() }] : [],
      completedBy: completedBy || "",
      completionDate: completionDate || "",
      containers: containers || 0,
      dateOfReceipt,
      projectName: projectName || "",
      receivedBy: receivedBy || "",
      receivedFrom: receivedFrom || "",
      sampleName,
      storage: storage || "",
      testsRequired: typeof testsRequired === "boolean" ? testsRequired : false,
      MachineMade: MachineMade || ""
    };

    await db.collection("Samples").doc(newId).set(newSample);
    res.status(201).send({ message: "Sample added successfully", id: newId });

  } catch (error) {
    console.error("❌ שגיאה בהוספת דגימה:", error);
    res.status(500).send({ error: "שגיאה בהוספת דגימה" });
  }
});

router.put("/:id/comment", async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    await db.collection("Samples").doc(id).update({ comment });
    res.status(200).send({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("❌ שגיאה בעדכון הערה:", error);
    res.status(500).send({ error: "שגיאה בעדכון הערה" });
  }
});

router.put("/:id/completion", async (req, res) => {
  const { id } = req.params;
  const { completionDate, completedBy } = req.body;

  if (!completionDate && !completedBy) {
    return res.status(400).send({
      error: "חובה לציין לפחות completionDate או completedBy",
    });
  }

  try {
    const updateData = {};

    if (completionDate) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(completionDate)) {
        const [year, month, day] = completionDate.split("-");
        updateData.completionDate = `${day}/${month}/${year}`;
      } else {
        updateData.completionDate = completionDate;
      }
    }

    if (completedBy) {
      updateData.completedBy = completedBy;
    }

    await db.collection("Samples").doc(id).update(updateData);
    res.status(200).send({ message: "Sample completion info updated successfully" });

  } catch (error) {
    console.error("❌ שגיאה בעדכון completion:", error);
    res.status(500).send({ error: "שגיאה בעדכון שדות השלמה" });
  }
});

//
// ✅ הוספת הערה לדגימה, כולל שם מכונה מתוך sample
//
router.post("/:id/add-comment", async (req, res) => {
  try {
    const id = req.params.id;
    const { text } = req.body;

    const querySnapshot = await db.collection("Samples").where("ID", "==", id).get();
    if (querySnapshot.empty) {
      return res.status(404).send("Sample not found");
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const existing = Array.isArray(data.comment) ? data.comment : [];

    const newComment = {
      text,
      date: new Date().toISOString(),
      machineUsed: data.MachineMade || "—"
    };

    await doc.ref.update({
      comment: [...existing, newComment]
    });

    res.status(200).send("Comment with machine added ✅");
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).send("Error adding comment");
  }
});



module.exports = router;
