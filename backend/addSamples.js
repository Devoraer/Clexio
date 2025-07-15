const admin = require("firebase-admin");
const serviceAccount = require("./clexio-data-base-firebase-adminsdk-fbsvc-c8ad3d3418.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// פונקציית שליפת מספר מזהה רץ
const getNextId = async () => {
  const counterRef = db.collection("IdCounters").doc("SamplesId");
  const result = await db.runTransaction(async (t) => {
    const doc = await t.get(counterRef);
    const current = doc.exists ? parseInt(doc.data().nextId) : 1;
    const next = current + 1;
    t.set(counterRef, { nextId: next.toString() });
    return current;
  });
  return result;
};

// רשימת דגימות לדוגמה 🧪
const sampleList = [
  {
    MachineMade: "HPLC-CLX2",
    clexioNumber: "25-002",
    comment: "sample for calibration",
    completedBy: "Sara",
    completionDate: "05/04/2025",
    containers: 2,
    dateOfReceipt: "03/03/2025",
    projectName: "CLE-301",
    receivedBy: "Sara",
    receivedFrom: "Teva",
    sampleName: "d124x",
    storage: "fridge",
  },
  {
    MachineMade: "HPLC-CLX3",
    clexioNumber: "25-003",
    comment: "initial run",
    completedBy: "Avi",
    completionDate: "10/04/2025",
    containers: 1,
    dateOfReceipt: "07/03/2025",
    projectName: "CLE-302",
    receivedBy: "Avi",
    receivedFrom: "Dexcel",
    sampleName: "d125y",
    storage: "room temperature",
  },
  {
    MachineMade: "HPLC-CLX4",
    clexioNumber: "25-004",
    comment: "stability test",
    completedBy: "Dana",
    completionDate: "15/04/2025",
    containers: 3,
    dateOfReceipt: "10/03/2025",
    projectName: "CLE-303",
    receivedBy: "Dana",
    receivedFrom: "Pluristem",
    sampleName: "d126z",
    storage: "freezer",
  }
];

// הוספת כל הדגימות אחת־אחת למסד 🎯
const addSampleList = async () => {
  for (const sample of sampleList) {
    const id = await getNextId();
    const newSample = {
      ID: id.toString(),
      ...sample,
    };

    try {
      await db.collection("Samples").doc(id.toString()).set(newSample);
      console.log("✅ Added sample ID:", id);
    } catch (err) {
      console.error("❌ Error adding sample ID:", id, err);
    }
  }
};

addSampleList();

