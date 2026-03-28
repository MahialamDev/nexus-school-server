const express = require('express');
const router = express.Router();
const {getDB} = require('../config/db')



router.get('/', async (req, res) => {
    const db = getDB();
    const query = {};

    
    const { className } = req.query;

    if (className) {
        query.class_name = className;
    }

    console.log(query)

    const result = await db.collection('exam-routine').find(query).toArray();
    res.send(result)
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