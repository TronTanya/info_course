import bcrypt from "bcryptjs";

const hash = process.argv[2];
const password = process.argv[3] ?? "Admin12345!";
const ok = await bcrypt.compare(password, hash);
console.log(JSON.stringify({ password, hashPrefix: hash.slice(0, 30), match: ok }));
