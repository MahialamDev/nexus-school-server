// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

// GET students by class
// routes/studentRoutes.js
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { className } = req.query; // ক্লায়েন্ট থেকে আসা ভ্যালু

    const query = {}; // এখানে 'role: student' কেটে দিন কারণ আপনার পাঠানো ডাটায় 'role' ফিল্ডটি নেই

    if (className) {
      // আপনার ডাটাবেসের ফিল্ডের নাম 'class_name'
      query.class_name = className; 
    }

    const students = await db
      .collection("users") // আপনার কালেকশন নাম কি 'users' নাকি 'students'? ডাটা অনুযায়ী চেক করে নিন
      .find(query)
      .toArray();

    res.send(students);
  } catch (err) {
    res.status(500).send({ message: "Server Error" });
  }
});

module.exports = router;