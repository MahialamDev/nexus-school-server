const express = require("express");
const { getDB } = require("../config/db");
const { generateUniqueStudentId } = require("../utils/generateStudentId");
const generateStudentRoll = require("../utils/generateStudentRoll");
const router = express.Router();

// all user get
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find().toArray();
    res.send(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

//student get with query
router.get("/students/all", async (req, res) => {
  try {
    const db = getDB();
    const students = await db.collection("users").find({ role: "student" }).toArray();
    res.send(students);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// specific student get with email
router.get('/student/:email', async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const query = { email: email, role: "student" };
    
    const student = await db.collection("users").findOne(query);

    if (!student) {
      return res.status(404).send({ message: "No student found with this email!" });
    }
    res.send(student);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// user role get by email
router.get("/role/:email", async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection("users").findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.send({ role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// user info get by email
router.get("/:email", async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection("users").findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});



// post new user
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const userInfo = req.body;
    if (!userInfo.email) return res.status(400).json({ message: "Email is required" });

    const existingUser = await db.collection("users").findOne({ email: userInfo.email });
    if (existingUser) return res.status(409).json({ message: "User already exists" });
     
    // Set className default to class-6 if not provided
    const className = userInfo.department || "class-6";
    const year = new Date().getFullYear();

    // id generate
    const student_id = await generateUniqueStudentId(db, userInfo.name, className, year);

    // roll generate
    const class_roll = await generateStudentRoll(db, className, year )

    const newUser = {
      name: userInfo.name || "Anonymous",
      email: userInfo.email,
      image: userInfo.image || "",
      role: "student",
      student_id,
      class_roll,
      phone: userInfo.phone || "Not Set",
      address: userInfo.address || "Not Set",
      department: className,
      status: "active",               // active | graduated
      enrollment_status: "enrolled",  // enrolled | pending | not_enrolled
      academic_year: year, 
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    res.send(result);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

// user update by email
router.patch("/:email", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("users").updateOne(
      { email: req.params.email }, 
      { $set: req.body }
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Update Error" });
  }
});

module.exports = router;