const express = require("express");
const app = express();
const cors = require('cors');

const userRouter = require('./routes/user.routes')
const attendanceRouter = require('./routes/attendance.routes');
const noticeRouter = require('./routes/notice.routes')
const assignmentRouter = require('./routes/assignment.routes');
// plolok vai er student route changed to studentFeedback router
const studentsFeedbackRouter = require('./routes/studentsFeedback.routes');
const routine = require('./routes/routine.routes');
const result = require('./routes/publishResult.routes')
const admissionRouter =require('./routes/admission.routes')
const examRoutine = require('./routes/examRoutine.routes')
const bookingRouter =require('./routes/booking.routes')
const studentsRouter =require('./routes/students.routes')
const notifications =require('./routes/notification.routes')
const studentRoutes = require("./routes/studentRoutes");
const temp = require("./routes/tempory.routes");

// middleware
app.use(express.json());
app.use(cors());

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
app.use('/assignments', assignmentRouter);
app.use('/exam-routine', examRoutine);

//students
app.use('/studentFeedback', studentsFeedbackRouter)

//routine routes
app.use('/routine',routine)
//Result Sheet routes
app.use('/result',result)

// admission
app.use('/admission', admissionRouter)
// booking
app.use('/bookings', bookingRouter)

// students route
app.use('/students', studentsRouter)

// notification route
app.use('/notifications',notifications)
// notification route
app.use('/temp',temp)




app.use("/students", studentRoutes);
// export app
module.exports = app;