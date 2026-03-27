const express = require('express');
const router = express.Router();
const {getDB}=require('../config/db')




// get student feedback data 
router.get('/feedback', async (req, res) => {
  try {
   const db= getDB()
    const email = req.query.email;
    if (!email) {
      return res.send({ message: 'not found' });
    }
    const query = { studentEmail: email };
    const result = await db.collection('studentFeedback').find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error)
  }

})

// post student feedback
router.post('/feedback', async (req, res) => {
  try {
    const db = getDB();
    const {
      studentEmail,
      teacherEmail,
      teacherName,
      subject,
      class: studentClass,
      studentId,

      role,
    } = req.body;

    // ✅ validation
    if (!studentEmail || !teacherEmail || !teacherName) {
      return res.send({ message: 'Missing required fields' });
    }

    // count all day hours
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    //  duplicate check
    const existing = await db.collection('studentFeedback').findOne({
      studentEmail,
      teacherEmail,
      teacherName,

      feedbackAt: { $gte: startOfDay },
    });

    // block feedback
    if (existing) {
      return res.send({
        message: 'আজকে এই subject-এ already feedback দেওয়া হয়েছে',
      });
    }

    // new feedback
    const feedback = {
      studentId,
      studentEmail,
      teacherEmail,
      teacherName,
      subject,
      class: studentClass,
      feedback: req.body.feedback,
      role,
      feedbackAt: new Date(),
    };

    // final post data
    const result = await db.collection('studentFeedback').insertOne(feedback);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
 

module.exports = router;

