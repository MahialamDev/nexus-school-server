const express = require("express");
const app = express();
const cors = require('cors');
const { connectDB } = require('./config/db'); // db.js path
const userRouter = require('./routes/user.routes')

// middleware
app.use(express.json());
app.use(cors());


// mongodb connect
connectDB();


// routes
app.get('/', (req, res) => {
    res.send("Rahat Your server is running")
}) 


// user Router
app.use('/api/users', userRouter)



// export app
module.exports = app;