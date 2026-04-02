const express = require('express');
const { getDB } = require('../config/db');
const { generateUniqueStudentId } = require('../utils/generateStudentId');
const generateStudentRoll = require('../utils/generateStudentRoll');
const { getTokenAuth, getAdminSecure } = require('../authSecure/authSecure');

const router = express.Router();

// all user get
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db
        .collection('users')
        .find()
        .sort({ createdAt: -1 }) // newest first (descending)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('users').countDocuments(),
    ]);

    res.send({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

//student get with query
router.get('/students/all', async (req, res) => {
  try {
    const db = getDB();
    const students = await db
      .collection('users')
      .find({ enrollment_status: 'enrolled' }) // role এর বদলে এটি দিন
      .toArray();
    res.send(students);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/teachers/all', async (req, res) => {
  try {
    const db = getDB();
    const teachers = await db
      .collection('users')
      .find({ role: 'teacher' })
      .toArray();

    res.send(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// specific student get with email
router.get('/student/:email', async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const query = { email: email, role: 'student' };

    const student = await db.collection('users').findOne(query);

    if (!student) {
      return res
        .status(404)
        .send({ message: 'No student found with this email!' });
    }
    res.send(student);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// user role get by email
router.get('/role/:email', async (req, res) => {
  try {
    const db = getDB();
    const user = await db
      .collection('users')
      .findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.send({ role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// user info get by email
router.get('/:email', async (req, res) => {
  try {
    const db = getDB();
    const user = await db
      .collection('users')
      .findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// post new user
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const userInfo = req.body;
    if (!userInfo.email)
      return res.status(400).json({ message: 'Email is required' });

    const existingUser = await db
      .collection('users')
      .findOne({ email: userInfo.email });
    if (existingUser)
      return res.status(409).json({ message: 'User already exists' });

    const newUser = {
      name: userInfo.name || 'Anonymous',
      email: userInfo.email,
      image: userInfo.image || '',
      role: 'user',
      phone: userInfo.phone || 'Not Set',
      address: userInfo.address || 'Not Set',
      status: 'active', // active | suspend
      createdAt: new Date(),
    };


    const result = await db.collection('users').insertOne(newUser);

    const tempData = {
      email: userInfo.email,
      wrongAttempts: 0,
      lockUntil: null,
    };
    // tepmray account lock data save in data base
    const temp = await db.collection('temp').insertOne(tempData);

    res.send(result);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

// user update by email
router.patch('/:email', async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection('users')
      .updateOne({ email: req.params.email }, { $set: req.body });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: 'Update Error' });
  }
});

// user delete by email
router.delete('/:email', async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;

    const userResult = await db.collection('users').deleteOne({ email: email });

    if (userResult.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.collection('temp').deleteOne({ email: email });

    res.send({
      success: true,
      message: 'User and associated data deleted successfully',
      deletedCount: userResult.deletedCount
    });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).send({ message: 'Internal Server Error during deletion' });
  }
});

module.exports = router;
