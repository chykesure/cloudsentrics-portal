// run once: node createSuperAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel"); // Use Staff model
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  // Check if super-admin already exists
  const existing = await Staff.findOne({ email, role: "super-admin" });
  if (existing) {
    console.log("Super-admin already exists:", email);
    process.exit(0);
  }

  // Hash the password
  const hashed = await bcrypt.hash(password, 10);

  // Create new super-admin in Staff collection
  const superAdmin = new Staff({
    email,
    password: hashed,
    role: "super-admin",
    active: true,
    lastLogin: null,
  });

  await superAdmin.save();
  console.log("Created super-admin:", email);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
