import bcrypt from "bcryptjs";

const hash = "$2b$12$mPLR/oVrbofeFKSJwIeqFeHu9mye2B5z3C6D1cZaIIef7485b/QYm";
const ok = await bcrypt.compare("Admin12345!", hash);
console.log("match", ok);
