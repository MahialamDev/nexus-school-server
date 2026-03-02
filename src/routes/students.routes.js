const express = require('express');
const router = express.Router();
const {getDB}=require('../config/db')

// get only student
router.get('/', async (req, res) => {
 try {
   const db = getDB();
   if (!db) {
    return res.status(500).send({ message: 'DB not connected' });
   }
   const role = 'student';
   const query = { role: role };
   const result = await db.collection('users').find(query).toArray();
   console.log(result)
   res.send(result);
 } catch (error) {
  console.log(error)
 }
})


// get student feedback data 
router.get('/feedback', async (req, res) => {
  try {
   const db= getDB()
    const email = req.query.email;
    if (!email) {
      return res.send({ message: 'not found' });
    }
    const query = { studentEmail: email, role: 'student' };
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
      subject,
      class: studentClass,
      studentId,
     role
    } = req.body;

    // ✅ validation
    if (!studentEmail || !teacherEmail || !subject || !studentClass) {
      return res.send({ message: 'Missing required fields' });
    }
    
    
    // count all day hours
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    //  duplicate check
    const existing = await db.collection('studentFeedback').findOne({
        studentEmail,
        teacherEmail,
        subject,
        class:studentClass,
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
       subject,
       class: studentClass,
       feedback:req.body.feedback,
       role,
       feedbackAt: new Date(),
     };

    // final post data
    const result = await db.collection('studentFeedback').insertOne(feedback);
    res.send(result);
  } catch (error) {
    console.log(error)
  }
})
 

module.exports = router;

