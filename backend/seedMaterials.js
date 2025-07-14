const { db } = require("./firebase");
const dayjs = require("dayjs");

const baseMaterials = [
  {
    Tradename: "Buffer Solution pH 4.01",
    Amount: 250,
    Unit: "ml",
    "Expiry Date": "10/07/2024",
    Location: "Main Shelf",
    Lot: "B2F34",
    No: "B1",
    CoA: "✓",
    MSDS: "✓",
    "CAS Number": "NA",
    Vendor: "Sigma-Aldrich",
  },
  {
    Tradename: "Acetic Acid 99%",
    Amount: 500,
    Unit: "ml",
    "Expiry Date": "15/03/2023",
    Location: "Acids Room",
    Lot: "AC9915",
    No: "A2",
    CoA: "✓",
    MSDS: "✓",
    "CAS Number": "64-19-7",
    Vendor: "Merck",
  },
  {
    Tradename: "Hydrochloric Acid 37%",
    Amount: 100,
    Unit: "ml",
    "Expiry Date": dayjs().add(5, "day").format("DD/MM/YYYY"),
    Location: "Acids Shelf",
    Lot: "HCL3725",
    No: "A3",
    CoA: "✓",
    MSDS: "✓",
    "CAS Number": "7647-01-0",
    Vendor: "Honeywell",
  },
  {
    Tradename: "Sodium Hydroxide",
    Amount: 300,
    Unit: "g",
    "Expiry Date": dayjs().add(7, "day").format("DD/MM/YYYY"),
    Location: "pH Station",
    Lot: "NAOH300",
    No: "B4",
    CoA: "✓",
    MSDS: "✓",
    "CAS Number": "1310-73-2",
    Vendor: "Alfa Aesar",
  },
  {
    Tradename: "Methanol HPLC",
    Amount: 1000,
    Unit: "ml",
    "Expiry Date": "15/12/2026",
    Location: "Solvents",
    Lot: "METH1000",
    No: "C1",
    CoA: "✓",
    MSDS: "✓",
    "CAS Number": "67-56-1",
    Vendor: "Carlo Erba",
  },
  {
    Tradename: "Potassium Chloride",
    Amount: 500,
    Unit: "g",
    "Expiry Date": "10/01/2027",
    Location: "Salts Room",
    Lot: "KCL2027",
    No: "C2",
    CoA: "✓",
    MSDS: "✓",
    "CAS Number": "7447-40-7",
    Vendor: "BDH Chemicals",
  }
];

async function seedMaterialsWithAutoId() {
  const counterRef = db.collection("IdCounters").doc("MaterialsId");

  try {
    const counterSnap = await counterRef.get();
    if (!counterSnap.exists) {
      throw new Error("❌ Missing MaterialsId document in IdCounters");
    }

    let nextId = counterSnap.data().nextId;

    for (const material of baseMaterials) {
      const docId = nextId.toString();
      await db.collection("Materials").doc(docId).set({
        ...material,
        ID: docId,
      });
      console.log(`✅ Added material ID ${docId}: ${material.Tradename}`);
      nextId++;
    }

    // Update the nextId
    await counterRef.update({ nextId });
    console.log(`🆗 Updated nextId to ${nextId}`);

  } catch (error) {
    console.error("❌ Error uploading materials:", error);
  }
}

seedMaterialsWithAutoId();
