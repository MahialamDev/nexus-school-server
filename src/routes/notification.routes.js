const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// get notifications data
router.get('/', async (req, res) => {
 try {
   const db = getDB();
   const { email,role } = req.query;
   
   if (!email) {
    return res.status(400).send({ message: 'Email is required' });
   }
   const query = {
     read: false,
     $or: [{ userEmail: email }, { open: 'public', for: role }],
   }
   

   const result = await db.collection('notifications').find(query).sort({ createAt: -1 }).limit(10).toArray();
   res.send(result);
 } catch (error) {
  console.log(error)
 }
})

// Already see notification then update read status false to true

router.patch('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: 'id is required' });
    };

   if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid ID' });
    };
    
    const query = { _id: new ObjectId(id) };
    const update = {
      $set: {
        read: true,
        seenAt: new Date(),
      },
    };
    const result = await db
      .collection('notifications')
      .updateOne(query, update);
    res.send(result);
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Something went wrong' });
  }
})

module.exports = router;