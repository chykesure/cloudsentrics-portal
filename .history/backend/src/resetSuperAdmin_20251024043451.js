// src/resetSuperAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = process.env.SUPER_ADMIN_EMAIL.toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  let admin = await Staff.findOne({ email });

  if (admin) {
    console.log("🔹 Super admin found, updating...");

    admin.role = "admin";
    admin.active = true;

    // Always rehash from env and **overwrite the field**
    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;

    await admin.save();
    console.log("✅ Super admin updated:", email);
  } else {
    console.log("🔹 Super admin not found, creating...");

    const hashedPassword = await bcrypt.hash(password, 10);
    admin = new Staff({
      email,
      password: hashedPassword,
      role: "admin",
      active: true,
      lastLogin: null,
    });

    await admin.save();
    console.log("✅ Super admin created:", email);
  }

  mongoose.disconnect();
  console.log("🎉 Done! Use these credentials to login:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main().catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});
