const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const { generateUniqueStudentId } = require("../utils/generateStudentId");
const generateStudentRoll = require("../utils/generateStudentRoll");

// post method for admission application
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(500).send("DB not connected");
    const applicationInfo = req.body;
    // Check duplicate email
    const existingEmail = await db.collection('admissions').findOne({ email: applicationInfo.email });
    if (existingEmail) {
      return res.status(409).send({ success: false, message: "Already applied" });
    }

    const name = await applicationInfo.firstName + " " + applicationInfo.lastName;

    const applicationData = {
      name,
      ...req.body,
      application_status: "pending",
      submittedAt: new Date(),
    };

    const result = await db.collection("admissions").insertOne(applicationData);
    // insertOne for frontend saving data in database and send response to frontend
    res.status(201).send({ success: true, ...result });
  } catch (error) {
    res
      .status(400)
      .send({ success: false, message: "Failed", error: error.message });
  }
});

// GET — all applications, newest first, paginated
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(500).send("DB not connected");

    // pagination is optional — if no query params, return everything (for client-side pagination)
    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    const cursor = db.collection("admissions").find().sort({ submittedAt: -1 });

    if (page && limit) {
      const skip = (page - 1) * limit;
      const total = await db.collection("admissions").countDocuments();
      const applications = await cursor.skip(skip).limit(limit).toArray();
      return res.status(200).send({ applications, total, page, totalPages: Math.ceil(total / limit) });
    }

    // no pagination params → return full sorted array (current frontend behaviour)
    const applications = await cursor.toArray();
    res.status(200).send(applications);
  } catch (error) {
    res.status(500).send({ message: "Server Error", error: error.message });
  }
});

// PATCH method for updating application status (Admin only)
router.patch("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { status } = req.body;

    if (!db) return res.status(500).send("DB not connected");

    const filter = { _id: new ObjectId(id) };

    const studentInfo = await db.collection("admissions").findOne(filter);

    if (!studentInfo) {
      return res.status(404).send({ message: "Admission not found" });
    }

    const existStudent = await db.collection("students").findOne({
      admission_id: studentInfo._id,
      email: studentInfo.email,
    });

    const className = studentInfo.class_name;
    const year = new Date().getFullYear();

    let student_id = null;
    let roll = null;

    // only generate when approved
    if (status === "approved") {
      student_id = await generateUniqueStudentId(
        db,
        studentInfo.name,
        className,
        year,
      );

      roll = await generateStudentRoll(db, className, year);
    }

    const updateDoc = {
      $set: {
        application_status: status,
        student_id,
        roll,
        enrollment_status: status === "approved" ? "enrolled" : "pending",
        academic_year: year,
      },
    };

    const result = await db
      .collection("admissions")
      .updateOne(filter, updateDoc);

    if (!existStudent && status.toLowerCase() === "approved") {
      await db.collection("students").insertOne({
        admission_id: studentInfo._id,
        name: studentInfo.name,
        email: studentInfo.email,
        class_name: className,
        phone: studentInfo.phone || "Not Set",
        address: studentInfo.address || "Not Set",
        student_id,
        roll,
        enrollment_status: "enrolled",
        academic_year: year,
        createdAt: new Date(),
      });

      const user = await db
        .collection("users")
        .findOne({ email: studentInfo.email });

      if (!user) {
        // Create a new user
        await db.collection("users").insertOne({
          name: studentInfo.name,
          email: studentInfo.email,
          phone: studentInfo.phone || "Not Set",
          address: studentInfo.address || "Not Set",
          role: "student", // default role
          status: "active",
          createdAt: new Date(),
        });

      } else {
        // Just update role if needed
        if (user.role !== "student") {
          await db
            .collection("users")
            .updateOne(
              { email: studentInfo.email },
              { $set: { role: "student" } },
            );
        }
      }
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Update failed", error: error.message });
  }
});

//  Delete a specific application
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    if (!db) return res.status(500).send("DB not connected");

    const query = { _id: new ObjectId(id) };
    const result = await db.collection("admissions").deleteOne(query);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting", error: error.message });
  }
});

module.exports = router;
