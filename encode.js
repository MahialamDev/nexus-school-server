const fs = require("fs");

const json = fs.readFileSync("./schoolAuthKey.json");
const base64 = Buffer.from(json).toString("base64");

console.log(base64);