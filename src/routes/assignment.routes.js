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
        const email = req.query.email;
        const user = await db.collection("users").findOne({ email: email });

        if (!user) {
        return res.status(404).json({ message: "User not found in Nexus database" });
        }
        
        const myClass = user.department;
        const result = await db.collection('assignments').find({ targetClass: myClass }).toArray();
        res.send(result);
        
    } catch (err) {
        console.log(err)
    }
})




module.exports = router;