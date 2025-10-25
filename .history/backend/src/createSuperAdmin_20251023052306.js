// run once: node createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  // ✅ Check if Admin already exists
  const existing = await Staff.findOne({ email, role: "admin" });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  // Hash the password
  const hashed = await bcrypt.hash(password, 10);

  // ✅ Create Admin (formerly Super-admin)
  const admin = new Staff({
    email,
    password: hashed,
    role: "admin", // ✅ updated role name
    active: true,
    lastLogin: null,
  });

  await admin.save();
  console.log("Created Admin:", email);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
