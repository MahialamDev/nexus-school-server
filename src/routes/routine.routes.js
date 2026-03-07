const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { className } = req.query;
    if (!className) {
      return res.send('plz update your class')
    }
    const result = await db
      .collection('routine')
      .find({ department :className})
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
    const result = await db.collection('routine').insertOne(routine);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
