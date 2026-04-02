const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db')

// check user account already is locked
router.get('/check-locke', async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.query;
    if (!email) {
      return res.status(403).send({ message: 'email not found' });
    }
    const query = { email };
    const userTemp = await db.collection('temp').findOne(query);
    
    if (userTemp?.lockUntil && userTemp.lockUntil > new Date()) {
       const remainingTime = Math.ceil(
         (userTemp.lockUntil - Date.now()) / 1000,
       );
      return res.json({ locked: true,remainingTime });
    }
    res.json({ locked: false });
    
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
})

router.patch('/login-failed', async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.body;
    if (!email) {
      return res.send({ message: 'email not found' });
    }
    const query = { email };
    const tempUser = await db.collection('temp').findOne(query);
    if (!tempUser) {
      return res.send({ message: 'user is  not found' });
    }

    if (tempUser.lockUntil && tempUser.lockUntil > new Date()) {
      return res.status(400).send({ message: 'Account already locked' });
    }

    const attempts = (tempUser.wrongAttempts || 0) + 1;
    if (attempts >= 5) {
      const tempLocke = await db.collection('temp').updateOne(query, {
        $set: {
          wrongAttempts: 0,
          lockUntil: new Date(Date.now() + 2 * 60 * 1000),
        },
      });
      return res.status(400).send({ message: 'Account locked waite 2 minutes' });
    }

   const  update = {
      $set: {
        wrongAttempts: attempts,
      },
    };
    const tempCount = await db.collection('temp').updateOne(query, update);
    res.send({ message: `${attempts} wrong attempts` });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// success login then apply this function
router.patch('/success', async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: 'email not found' });
    }
    
    const update = {
      $set: {
        wrongAttempts: 0,
        lockUntil:null
      },
    };
    const tempUpdate= await db.collection('temp').updateOne({email},update)
    res.send('done')
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
})


module.exports = router;