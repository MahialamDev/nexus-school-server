const express = require("express");
const app = express();
const cors = require('cors');
const { connectDB } = require('./config/db'); // db.js path
const userRouter = require('./routes/user.routes')
const attendanceRouter = require('./routes/attendance.routes');
const noticeRouter = require('./routes/notice.routes')
const assignmentRouter = require('./routes/assignment.routes')

// middleware
app.use(express.json());
app.use(cors());


// mongodb connect
connectDB();


// routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "NexSchool server is running smoothly 🚀",
        timestamp: new Date().toISOString(),
        info: {
            name: "NexSchool API",
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development"
        }
    });
});





// user Router
app.use('/users', userRouter)
app.use('/attendance', attendanceRouter);
app.use('/notices', noticeRouter)


// teacher 
app.use('/assignments', assignmentRouter)



// export app
module.exports = app;