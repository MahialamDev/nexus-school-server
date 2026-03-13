const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

// POST /users/bookings
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const { teacherId, studentEmail, date, slot, agenda, teacherName, teacherEmail } = req.body;

    // same slot check
    const existingBooking = await db.collection("bookings").findOne({
      teacherId: teacherId,
      date: date,
      slot: slot,
      status: { $ne: "rejected" }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This slot is already reserved."
      });
    }

    const newBooking = {
      teacherId,
      teacherName,
      teacherEmail,
      studentEmail,
      date,
      slot,
      agenda: agenda || "General Discussion",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(newBooking);
    res.status(201).send({ success: true, insertedId: result.insertedId, message: "Request sent!" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
// get all bookings
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("bookings").find().sort({ createdAt: -1 }).toArray();
    res.status(200).send(result);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// get bookings by teacher email
router.get("/teacher/:email", async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const result = await db.collection("bookings")
      .find({ teacherEmail: email })
      .sort({ createdAt: -1 })
      .toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Error fetching data" });
  }
});
// PATCH /bookings/:id (Update status)
router.patch("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const { status } = req.body; // status: 'approved' or 'rejected'
    const { ObjectId } = require("mongodb");

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { status: status },
    };

    const result = await db.collection("bookings").updateOne(filter, updateDoc);
    res.send({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).send({ success: false, message: "Update failed" });
  }
});

module.exports = router;