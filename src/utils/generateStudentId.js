async function generateUniqueStudentId(db, name, className, year) {
  const classCode = `C${className}`
  const initials = (name || "AN").trim().substring(0, 2).toUpperCase();

  const counterId = `student_serial_${year}`;

  // findOneAndUpdate 
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { 
      upsert: true,           // if no data then add new
      returnDocument: "after" //return update data
    }
  );

  // driver version fix
  const seq = (counter.value ? counter.value.seq : counter.seq);

  const serial = seq.toString().padStart(4, "0"); 
  const yearCode = year.toString().slice(-2);
  const randomNumber = Math.floor(10 + Math.random() * 90);

  return `STU-${classCode}-${yearCode}-${initials}${randomNumber}-${serial}`;
}

module.exports = { generateUniqueStudentId };