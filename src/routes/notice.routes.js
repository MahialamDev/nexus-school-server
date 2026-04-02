const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

// get all notices
router.get("/", async (req, res) => {
    try {
        
        const db = getDB();
        const today = new Date();

        const notices = await db.collection('notices').find({ expiryDate: { $gte: today } }).sort({ createdAt: -1 }).toArray();

        res.send(notices);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
});


// post a notice
router.post("/", async (req, res) => {
    try {
        const db = getDB();
        const noticeInfo = req.body;

        // validation
        if (!noticeInfo.title || !noticeInfo.content) {
            return res.status(400).json({
                message: "Title and Content are required"
            });
        }

        const newNotice = {
          title: noticeInfo.title,
          content: noticeInfo.content,
          category: noticeInfo.category || 'General',
          priority: noticeInfo.priority || 'Normal',
          startAt: new Date(noticeInfo.startAt),
          expiryDate: new Date(noticeInfo.expiryDate),
          createdAt: new Date(),
        };

        const result = await db.collection("notices").insertOne(newNotice);
        const newNotifications = {
          type: 'notice',
          notifications: `school notice :  ${noticeInfo.title}`,
          read: false,
          open:'public',
          for:'student',
          seeId: result?.insertedId,
          link: `/dashboard/school-notices`,
          createAt: new Date(),
        };
        const notifications = await db.collection('notifications').insertOne(newNotifications);


        res.send(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Insert Error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;

        // validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Notice ID" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await db.collection("notices").deleteOne(query);

        if (result.deletedCount === 1) {
            res.send(result);
        } else {
            res.status(404).json({ message: "Notice not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Delete Error" });
    }
});

module.exports = router;