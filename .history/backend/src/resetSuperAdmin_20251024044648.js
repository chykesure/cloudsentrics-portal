const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SUPER_ADMIN_EMAIL.toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  let admin = await Staff.findOne({ email });

  if (!admin) {
    const hashed = await bcrypt.hash(password, 10);
    admin = new Staff({
      email,
      password: hashed,
      role: "admin",
      active: true,
      lastLogin: null,
    });
    await admin.save();
    console.log("✅ Super admin created:", email);
  } else {
    console.log("⚠️ Super admin already exists, skipping creation");
  }

  mongoose.disconnect();
}

main().catch(console.error);
