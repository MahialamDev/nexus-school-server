const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
// post method for admission application
router.post('/', async (req, res) => {
    try {
        const db = getDB();
        if (!db) return res.status(500).send('DB not connected');

        const applicationData = {
            ...req.body,
            status: 'pending', 
            submittedAt: new Date()
        };

        const result = await db.collection('admissions').insertOne(applicationData);
        // insertOne for frontend saving data in database and send response to frontend
        res.status(201).send({ success: true, ...result }); 
    } catch (error) {
        res.status(400).send({ success: false, message: "Failed", error: error.message });
    }
});

// GET method for fetching all applications (Admin only)
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        if (!db) return res.status(500).send('DB not connected');

        const applications = await db.collection('admissions')
            .find()
            .sort({ submittedAt: -1 })
            .toArray();

        res.status(200).send(applications); 
    } catch (error) {
        res.status(500).send({ message: "Server Error", error: error.message });
    }
});

// PATCH method for updating application status (Admin only)
router.patch('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { status } = req.body; // UPDATE FRONTEND STATUS

        if (!db) return res.status(500).send('DB not connected');

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: { status: status },
        };

        const result = await db.collection('admissions').updateOne(filter, updateDoc);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: "Update failed", error: error.message });
    }
});

//  Delete a specific application
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;
        if (!db) return res.status(500).send('DB not connected');

        const query = { _id: new ObjectId(id) };
        const result = await db.collection('admissions').deleteOne(query);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: "Error deleting", error: error.message });
    }
});

module.exports = router;