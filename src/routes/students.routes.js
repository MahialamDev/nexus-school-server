const express = require('express');
const router = express.Router();
const {getDB}=require('../config/db');
const { ObjectId } = require('mongodb');

// get only student
router.get('/', async (req, res) => {
 try {
   const db = getDB();
   const { class_name,limit,skip } = req.query;
   
   if (!db) {
    return res.status(500).send({ message: 'DB not connected' });
   }
 
   const query = { };
   if (class_name) {
     query.class_name = class_name;
   }
   const result = await db.collection('students').find(query).limit(Number(limit)).skip(Number(skip)).toArray();
   
   const allStudent =await  db.collection('students').countDocuments(query);
   
   res.send({result: result ,allStudent});
 } catch (error) {
  console.log(error)
 }
})

// onlyGet one student with email
router.get('/single-student', async (req, res) => {
  try {
    const db = getDB();
    const { email} = req.query;
    const query = {email };
    const result = await db.collection('students').findOne(query);
    res.send(result);
    
  } catch (error) {
    console.log(error);
  }
})
// onlyGet one student with params
router.get('/student/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const query = { _id:new ObjectId(id) };
    const result = await db.collection('students').findOne(query);
    res.send(result);
    
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;