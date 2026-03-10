const express = require('express');
const router = express.Router();
const {getDB} = require('../config/db')



router.get('/', async (req, res) => {
    const db = getDB();
     const result = await db.collection('exam-routine').find().toArray();
})


router.post('/', async(req, res) => {
    try {
        const db = getDB();
        const routineInfo = req.body;
        const result = await db.collection('exam-routine').insertOne(routineInfo);
        res.send(result)

    } catch (err) {
        console.log(err)
    }
    
})





module.exports = router;