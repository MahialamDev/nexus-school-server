const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');


// get result sheet 
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { studentRoll,  examOption, className, studentEmail } = req.query;
    const query = { examOption, studentRoll, className, studentEmail };
    const result = await db.collection('result').findOne(query);
    res.send(result);
  
  } catch (error) {
    console.log(error)
  }
});

// onlyGet one user 
router.get('/one-student', async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.query;
    const query = {role:'student', email };
    const result = await db.collection('users').findOne(query);
    res.send(result);
    
  } catch (error) {
    console.log(error);
  }
})

// only show result student base
router.get('/student-result', async (req, res) => {
  try {
    const db = getDB();
    const { email, examOption, className } = req.query;

    const query = { studentEmail:email,className };
    if (examOption) {
      query.examOption = examOption;

      const cursor = await db.collection('result').findOne(query);
      return res.send(cursor);
    }

    const result = await db.collection('result').findOne(query,{sort:{createAt:-1}});
    res.send(result)
    
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
    body.createAt = new Date();
    const query = {
      studentEmail,
      studentRoll,
      className,
      examOption,
    }


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