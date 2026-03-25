require("dotenv").config();
const { connectDB, getDB } = require("../config/db");

async function fixStudentIds() {
  try {
    await connectDB();
    const db = getDB();

    //   You can writte your won script

    console.log("✅ All student_ids have been synchronized successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
}

fixStudentIds();
