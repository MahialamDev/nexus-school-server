let admin = require('firebase-admin');
const { getDB } = require('../config/db');
const serviceAccount = require(`${process.env.FBas_Key_File}`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middle wear user do not login then no access any data
const getTokenAuth = async (req, res, next) => {
  //  console.log(req.headers)
  
  try {
     const tokenHeader = req.headers.authorization;
     if (!tokenHeader) {
       return res.status(401).json({ message: 'No token provided' });
     }
     const authToken = tokenHeader.split(' ')[1];
     if (!authToken) {
       return res.status(401).json({ message: 'Invalid token format' });
     }
   
    const decoded = await admin.auth().verifyIdToken(authToken);
    // console.log('decoded', decoded);
    req.token_email = decoded.email
     
    next()

  } catch (error) {
    console.log(error)
     return res.status(403).json({ message: 'Token is not valid' });
  }

}

// only access admin this fun
const getAdminSecure = async(req, res, next) => {
  try {
    const db = getDB();
    const email = req.token_email
    if (!email) {
      return res.status(401).json({ message: 'Invalid email' });
    }
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next()
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// teacher role secure
const getTeacherSecure = async (req, res, next) => {
  try {
    
    const db = getDB();
    const email = req.token_email;
    if (!email) {
      return res.status(401).json({ message: 'Invalid email' });
    }
     const user = await db.collection('users').findOne({ email });
     if (!user) {
       return res.status(404).json({ message: 'User not found' });
    }
     if (user?.role !== 'teacher') {
       return res.status(403).json({ message: 'Access denied.  teacher only' });
     }
     next();
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// student role secure 
const getStudentSecure = async (req, res, next) => {
  try {
    const db = getDB();
    const email = req.token_email;
    console.log(email)
    if (!email) {
      return res.status(401).send({ message: 'Invalid email' });
    }
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    if ( user?.role !== 'student') {
       return res.status(403).send({ message: 'Access denied.  student only' });
    }
    next()

  } catch (error) {
     console.log(error);
     return res.status(500).send({
       message: 'Internal server error',
     });
  }
}



module.exports = { getTokenAuth,getAdminSecure,getStudentSecure,getTeacherSecure };