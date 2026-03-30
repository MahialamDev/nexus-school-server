const express = require("express");
const router = express.Router();
const { getDB } = require('../config/db');

router.post('/', async(req, res) => {
    try {
        const db = getDB();
        const assignmentInfo = req.body;
        const assignmentCollection = db.collection('assignments');
        const result = await assignmentCollection.insertOne(assignmentInfo);
        res.send(result)
    } catch(err) {
       console.log(err)
   }
})

router.get('/', async(req, res) => {
    try {
        const db = getDB();
        const assignmentCollection = db.collection('assignments');
        const result = await assignmentCollection.find().toArray();
        res.send(result)
    } catch(err) {
       console.log(err)
   }
})

router.get('/my-assignment', async(req, res)=> {
    try {
        const db = getDB();
        const { className } = req.query;
        const result = await db.collection('assignments').find({ targetClass: className }).toArray();
        res.send(result);
        
    } catch (err) {
        console.log(err)
    }
})




module.exports = router;