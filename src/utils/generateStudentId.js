async function generateUniqueStudentId(db, name, className, year) {
  const classCode = className.replace("class-", "C");
  const initials = (name || "AN").trim().substring(0, 2).toUpperCase();

  const counterId = `student_serial_${year}`;

  // findOneAndUpdate এর মাধ্যমেই চেক এবং ইনক্রিমেন্ট একবারে করা সম্ভব
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { 
      upsert: true,           // যদি না থাকে তবে তৈরি করবে
      returnDocument: "after" // আপডেটেড ডাটা রিটার্ন করবে
    }
  );

  // ড্রাইভার ভার্সন অনুযায়ী ডাটা এক্সট্রাক্ট করা
  // কিছু ভার্সনে সরাসরি counter, কিছুতে counter.value থাকে
  const seq = (counter.value ? counter.value.seq : counter.seq);

  const serial = seq.toString().padStart(4, "0"); 
  const yearCode = year.toString().slice(-2);
  const randomNumber = Math.floor(10 + Math.random() * 90);

  return `STU-${classCode}-${yearCode}-${initials}${randomNumber}-${serial}`;
}

module.exports = { generateUniqueStudentId };