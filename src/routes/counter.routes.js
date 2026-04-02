const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// get all notices
router.get('/', async (req, res) => {
  try {
    const db = getDB();

    const totalStudents = await db.collection('students').countDocuments();
    const totalUsers = await db.collection('users').countDocuments();
    const totalRoutine = await db.collection('class_routine').countDocuments();
    

    res.send({totalStudents,totalUsers,totalRoutine});
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;
