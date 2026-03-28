const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

// --- POST: Take Attendance (Save) ---
router.post("/", async (req, res) => {
    try {
        const db = getDB();
        const { className, subject, date, teacherEmail, students } = req.body;

        if (!className || !subject || !date || !students?.length) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const selectedDate = new Date(date);
        // টাইমস্ট্যাম্প রিমুভ করে শুধুমাত্র দিনটি চেক করার জন্য 00:00:00 সেট করা ভালো
        selectedDate.setHours(0, 0, 0, 0);

        // 🔴 Duplicate Check
        const existingAttendance = await db.collection("attendance").findOne({
            className,
            subject,
            date: selectedDate
        });

        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: "Attendance already taken for this class and subject on this date"
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
        console.error("Post Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- GET: Fetch Attendance (Merged logic) ---
// --- GET: Fetch Attendance (UPDATED) ---
router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const { className, date, startDate, endDate } = req.query;

        const query = {};

        // ✅ Class filter
        if (className) {
            query.className = className;
        }

        // 🔥 Date Range (NEW)
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            query.date = {
                $gte: start,
                $lte: end
            };
        }

        // 🔹 Single Date (OLD)
        else if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);

            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            query.date = {
                $gte: start,
                $lte: end
            };
        }

        const attendance = await db.collection("attendance")
            .find(query)
            .sort({ date: -1 })
            .toArray();

        res.status(200).send(attendance);

    } catch (error) {
        console.error("Get Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;