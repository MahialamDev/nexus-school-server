
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simplecrud.h04rjld.mongodb.net/?appName=SimpleCrud`;
//  DNS issue solution for MongoDB Atlas
const dns = require('dns');
const { read } = require('fs');
dns.setServers(['8.8.8.8', '1.1.1.1']);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


let db;



const connectDB = async function run() {
  try {
    await client.connect();
    db = client.db('nexus-school');
    let feedbackCollection = db.collection('studentFeedback');

    await feedbackCollection.createIndex(
      { feedbackAt: 1 },
      { expireAfterSeconds: 86400 },
    );
    
     console.log('Mongodb connected!');
   
  } catch (err) {
      console.log(err)
  }
  
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}



// export
const getDB = () => db;
module.exports = { connectDB, getDB };

