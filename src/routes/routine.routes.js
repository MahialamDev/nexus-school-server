const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { getTokenAuth, getStudentSecure } = require('../authSecure/authSecure');



router.get('/',  async (req, res) => {
  
  try {
    
    const db = getDB();
    const { class_name } = req.query;
    if (!class_name) {
      return res.send('plz update your class');
    }
    const result = await db
      .collection('class_routine')
      .find({ class_name: class_name })
      .toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

router.post('/', async (req, res) => {
  try {
    
    const db = getDB();
    const routine = req.body;
    routine.createAt = new Date();

    const query = {
      day: routine.day,
      time: routine.time,
      period: routine.period,
      subject: routine.subject,
      teacherName: routine.teacherName,
    };
    const findClass = await db.collection('class_routine').findOne(query);
    if (findClass) {
      return res.send({
        message: 'already create routine plz check and only update now',
      });
    }

    const result = await db.collection('class_routine').insertOne(routine);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const db = getDB();

    const query = { _id: new ObjectId(id) };
    const update = {
      $set: body
      
    };
    const result = await db.collection('class_routine').updateOne(query, update);
    res.send(result);
    
  } catch (error) {
    console.log(error);
  }

})

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const db = getDB();
    const query = { _id: new ObjectId(id) };
    const result = await db.collection('class_routine').deleteOne(query);
    res.send(result);
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;
