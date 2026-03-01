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
    const db = getDB();
    const email = req.query.email;
    if (!email) {
      return res.send({ message: 'not found' });
    }
    const query = { studentEmail: email, role: 'student' };
    const result = await db
      .collection('studentFeedback')
      .find( query )
      .toArray();
    res.send(result);
  } catch (error) {
    console.log(error)
  }

})

// post student feedback
router.post('/feedback', async (req, res) => {
  try {
    const db = getDB();
    const feedback = req.body;
    feedback.feedbackAt = new Date();
    if (feedback.length === 0) {
      return res.status(404).send({ message: 'plz send data' });
    }
    const result = await db.collection('studentFeedback').insertOne(feedback);
    res.send(result)

   
  } catch (error) {
    console.log(error)
  }
})
 

module.exports = router;