const express = require("express");
const app = express();
const cors = require('cors');

const userRouter = require('./routes/user.routes')
const attendanceRouter = require('./routes/attendance.routes');
const noticeRouter = require('./routes/notice.routes')
const assignmentRouter = require('./routes/assignment.routes');
const studentsRout =require('./routes/students.routes')
const admissionRouter =require('./routes/admission.routes')
const bookingRouter =require('./routes/booking.routes')

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

//students
app.use('/student',studentsRout)
// admission
app.use('/admission', admissionRouter)
// booking
app.use('/bookings', bookingRouter)



// export app
module.exports = app;