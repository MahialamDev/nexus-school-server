const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');


// get result sheet 
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { studentRoll, examOption, class_name, studentEmail } = req.query;
    // if we  want to  a see email base result then only add query *studentEmail*
    const query = { examOption, studentRoll, class_name };
    const result = await db.collection('result').findOne(query);
    res.send(result);
  } catch (error) {
    console.log(error)
  }
});


// only show result student base
router.get('/student-result', async (req, res) => {
  try {
    const db = getDB();
    const { email, examOption, class_name } = req.query;

    const query = {studentEmail:email,class_name };
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

router.get('/getResult',async (req, res) => {
  const db = getDB();
  const {class_name,examOption}=req.query
  const query = {}
  if (class_name && examOption) {
     query.class_name = class_name,
     query.examOption=examOption
  }
  const result = await db.collection('result').find(query).toArray();
  res.send(result)
})

// post Result Sheet data
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const {  class_name, examOption,  studentEmail,studentRoll } =
    req.body
    
    const body = req.body;
   
    body.studentName = body.studentName.toLowerCase();
    body.createAt = new Date();
    body.createYear=new Date().getFullYear()
    const query = {
      studentEmail,
      class_name,
      studentRoll,
      examOption,
    }
   

    const sheet = await db.collection('result').findOne(query);
   
    if (sheet) {
      return res.send({
        message: 'Already give a result this Student',
      });
    }

    const result = await db.collection('result').insertOne(body);
    
    const newNotifications = {
      userEmail: studentEmail,
      type: 'Result',
      notifications: `Your result for ${examOption} has been published`,
      read: false,
      seeId: result?.insertedId,
      link: `/dashboard/student-result`,
      createAt: new Date(),
    };
    const notifications = await db.collection('notifications').insertOne(newNotifications);

    res.send(result);
    
  } catch (error) {
    console.log(error)
  }
  
})


module.exports = router;