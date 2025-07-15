// 📁 backend/AddSampleComment.js

const admin = require("firebase-admin");
const serviceAccount = require("./clexio-data-base-firebase-adminsdk-fbsvc-c8ad3d3418.json");

// 🔐 התחברות ל-Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🔄 פונקציה שמוסיפה כמה הערות לדגימה
async function addSampleComments(sampleId, commentsTextList) {
  const sampleRef = db.collection("Samples").doc(sampleId);

  const comments = commentsTextList.map((text) => ({
    text,
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  }));

  for (const comment of comments) {
    await sampleRef.update({
      comment: admin.firestore.FieldValue.arrayUnion(comment),
    });
  }

  console.log(`✅ Added ${comments.length} comments to sample ${sampleId}`);
}

// 🧬 רשימת הערות לכל דגימה
const sampleCommentsMap = {
  "1": [
    "Stable in water for 24 hours 💧",
    "Stable at 40°C for 36 hours 🌡️",
    "No degradation in acidic environment (pH 3.0) 🧪"
  ],
  "10": [
    "Resistant to UV exposure for 48 hours ☀️",
    "Stable at cold temperature (4°C) for 72 hours ❄️"
  ],
  "11": [
    "Remained effective after freeze-thaw cycle ❄️🔥",
    "No chemical change after 60 hours at 30°C 🧬"
  ],
  "12": [
    "Stable under high humidity (85%) 💦",
    "Did not degrade under shaking test for 12h 🌀"
  ],
  "14": [
    "Passed heat shock test at 50°C for 6 hours 🔥",
    "Stable during 1000 RPM centrifuge for 30 minutes 🧲"
  ],
  "15": [
    "Maintained pH stability in solution for 3 days 🧫",
    "No visual color change after sunlight exposure 🌞"
  ]
};

// 🧠 הפעלת ההוספה לכל הדגימות
async function run() {
  for (const [sampleId, comments] of Object.entries(sampleCommentsMap)) {
    await addSampleComments(sampleId, comments);
  }

  console.log("🎉 All comments added successfully!");
  process.exit();
}

run().catch((err) => {
  console.error("❌ שגיאה:", err);
  process.exit(1);
});
