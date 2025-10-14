// run once: node createSuperAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@example.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperSecret123";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Super-admin already exists:", email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = new Admin({ email, password: hashed, role: "super-admin" });
  await admin.save();
  console.log("Created super-admin:", email);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
