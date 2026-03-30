const express = require("express");
const router = express.Router();
const { getDB } = require('../config/db');





router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('payments').find().toArray();
        res.send(result)
    } catch (err) {
        console.log(err)
    }
})


router.post('/', async (req, res) => {
    try {
        const db = getDB();
    const paymentInfo = req.body;
        const result = await db.collection('payments').insertOne(paymentInfo)
        res.send(result)
        
    } catch (err) {
        console.log(err)
    }    
})















module.exports = router;