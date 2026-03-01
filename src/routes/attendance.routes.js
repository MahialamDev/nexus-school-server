const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

// Take Attendance (Save)
router.post("/", async (req, res) => {
    try {
        const db = getDB();
        const { className, subject, date, teacherEmail, students } = req.body;

        if (!className || !subject || !date || !students?.length) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const selectedDate = new Date(date);

        // 🔴 Duplicate Check (Same class + subject + date)
        const existingAttendance = await db.collection("attendance").findOne({
            className,
            subject,
            date: selectedDate
        });

        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: "Attendance already taken for this date"
            });
        }

        const attendanceData = {
            className,
            subject,
            date: selectedDate,
            teacherEmail,
            students,
            createdAt: new Date()
        };

        const result = await db.collection("attendance").insertOne(attendanceData);

        res.status(201).json({
            success: true,
            message: "Attendance saved successfully",
            result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get Attendance by Class + Date
router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const { className, date } = req.query;

        const query = {};
        if (className) query.className = className;
        if (date) query.date = new Date(date);

        const data = await db.collection("attendance").find(query).toArray();

        res.send(data);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const { className, date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const query = {
            date: { $gte: startDate, $lte: endDate }
        };

        if (className) {
            query.className = className;
        }

        const attendance = await db.collection("attendance").find(query).toArray();

        res.send(attendance);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;