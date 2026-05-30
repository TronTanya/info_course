const bcrypt = require("bcryptjs");
const hash = process.argv[2];
const password = process.argv[3] ?? "Admin12345!";
bcrypt.compare(password, hash).then((match) => {
  console.log(JSON.stringify({ password, hashPrefix: hash.slice(0, 30), match }));
});
