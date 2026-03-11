const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');


// get result sheet 
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { studentRoll, className, examOption, studentEmail } = req.query;
    const query = { studentEmail, studentRoll,examOption};
    const result = await db.collection('result').findOne(query);
    res.send(result);
  
 } catch (error) {
  console.log(error)
 }
})

// post Result Sheet data
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { studentRoll, className, examOption, studentName, studentEmail } =
    req.body
    
    const body = req.body;
    body.studentName = body.studentName.toLowerCase();
    const query = {
      studentEmail,
      studentName,
      studentRoll,
      className,
      examOption,
    };

    const sheet = await db.collection('result').findOne(query);
    if (sheet) {
      return res.send({
        message: 'already give a result this Student plz you only update now',
      });
    }

    const result = await db.collection('result').insertOne(body);
    res.send(result);
    
  } catch (error) {
    console.log(error)
  }
  
})


module.exports = router;