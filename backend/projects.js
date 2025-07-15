// 📁 backend/projects.js
const express = require('express');
const router = express.Router();
const { db } = require('./firebase');

// 🔍 שליפת כל הפרויקטים
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('Project').get();
    const projects = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data["Project Name"] || '',
        startDate: data["Start Date"] || '',
        endDate: data["endDate"] || '',
        status: data["status"] || 'Active',
        priority: data["priority"] || 'Medium',
        description: data["description"] || '',
        teamMembers: data["teamMembers"] || 0,
        progress: data["progress"] || 0,
        budget: data["budget"] || 0,
        manager: data["manager"] || '',
      };
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error('❌ שגיאה בשליפת פרויקטים:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// 🔍 שליפת פרויקט בודד לפי ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('Project').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Project not found');

    const data = doc.data();
    const project = {
      id: doc.id,
      name: data["Project Name"] || '',
      startDate: data["Start Date"] || '',
      endDate: data["endDate"] || '',
      status: data["status"] || 'Active',
      priority: data["priority"] || 'Medium',
      description: data["description"] || '',
      teamMembers: data["teamMembers"] || 0,
      progress: data["progress"] || 0,
      budget: data["budget"] || 0,
      manager: data["manager"] || '',
    };

    res.status(200).json(project);
  } catch (error) {
    console.error('❌ שגיאה בשליפת פרויקט:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// 🔄 עדכון פרויקט לפי ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await db.collection('Project').doc(id).update({
      "Project Name": data.name,
      "Start Date": data.startDate,
      endDate: data.endDate,
      status: data.status,
      priority: data.priority,
      description: data.description,
      teamMembers: Number(data.teamMembers),
      progress: Number(data.progress),
      budget: Number(data.budget),
      manager: data.manager,
    });

    res.status(200).send("✅ Project updated successfully");
  } catch (error) {
    console.error("❌ שגיאה בעדכון פרויקט:", error);
    res.status(500).send("Error updating project");
  }
});


module.exports = router;
