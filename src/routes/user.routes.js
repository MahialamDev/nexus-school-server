const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db"); // db.js path

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



// insert user data

router.post("/", async (req, res) => {
  try {
    const db = getDB();

    const userInfo = req.body;

    // Email
    if (!userInfo.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // check existing
    const existingUser = await db
      .collection("users")
      .findOne({ email: userInfo.email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }


    userInfo.role = "student";
    userInfo.createdAt = new Date();

    const result = await db.collection('users').insertOne(userInfo);
      res.send(result);
  } catch (err) {
      console.log(err);
  }
});



// export router
module.exports = router;
