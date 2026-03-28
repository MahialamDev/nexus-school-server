// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

// GET students by class
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { className } = req.query;

    const query = {};

    if (className) {
      query.department = className;
    }

    const students = await db
      .collection("users")
      .find({ role: "student", ...query })
      .toArray();

    res.send(students);
  } catch (err) {
    res.status(500).send({ message: "Server Error" });
  }
});

module.exports = router;