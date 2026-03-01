const express = require("express");
const { getDB } = require("../config/db");// db.js path
const router = express.Router();
 

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find().toArray();
    res.send(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// user info by email
router.get("/:email", async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;

    const user = await db.collection("users").findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found in Nexus database" });
    }
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// user role by email
router.get("/role/:email", async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const user = await db.collection("users").findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send({ role: user.role });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// get only student
router.get('/all-students', async (req, res) => {
 try {
   const db = getDB();
   if (!db) {
    return res.status(500).send({ message: 'DB not connected' });
   }
   const role = 'student';
   const query = { role: role };
   const result = await db.collection('users').find(query).toArray();
   console.log(result)
   res.send(result);
 } catch (error) {
  console.log(error)
 }
})




// insert user data

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const userInfo = req.body;

    if (!userInfo.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await db.collection("users").findOne({ email: userInfo.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // data structure before insert
    const newUser = {
      name: userInfo.name || "Anonymous",
      email: userInfo.email,
      image: userInfo.image || "", // if image is not provided, set it to an empty string
      role: "student", // default role is student
      phone: userInfo.phone || "Not Set",
      address: userInfo.address || "Not Set",
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// update user role by email
router.patch("/:email", async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const updatedInfo = req.body;

    const filter = { email: email };
    const updateDoc = {
      $set: updatedInfo,
    };

    const result = await db.collection("users").updateOne(filter, updateDoc);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Update Error" });
  }
});



// export router
module.exports = router;
