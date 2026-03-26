
async function generateStudentRoll(db, className, academicYear) {
  // counterId - "class-6_2026" বা "class-8_2026"
  const counterId = `class-${className}_${academicYear}`;

  const counter = await db.collection("roll_counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after" 
    }
  );

  
  const currentSeq = counter.value ? counter.value.seq : counter.seq;

  // formate
  return currentSeq.toString().padStart(2, "0");
}

module.exports = generateStudentRoll;