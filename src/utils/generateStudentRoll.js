
async function generateStudentRoll(db, department, academicYear) {
  // counterId হবে "class-6_2026" বা "class-8_2026"
  const counterId = `${department}_${academicYear}`;

  const counter = await db.collection("roll_counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after" // আপডেট হওয়ার পরের ডকুমেন্টটি রিটার্ন করবে
    }
  );

  // MongoDB ড্রাইভারের ভার্সন ভেদে counter.value বা সরাসরি counter থেকে seq নিতে হতে পারে
  const currentSeq = counter.value ? counter.value.seq : counter.seq;

  // ২ ডিজিট ফরম্যাট করতে (যেমন: 01, 02) padStart ব্যবহার করা হয়েছে
  return currentSeq.toString().padStart(2, "0");
}

module.exports = generateStudentRoll;