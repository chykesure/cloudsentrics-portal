// src/resetSuperAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel");
require("dotenv").config();

async function main() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SUPER_ADMIN_EMAIL.toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  // Check if super admin exists
  let admin = await Staff.findOne({ email }).select("+password");

  if (admin) {
    console.log("🔹 Super admin found, updating...");
    admin.role = "admin";
    admin.active = true;

    // Only overwrite password if needed
    admin.password = password; // let schema pre-save hook hash it

    await admin.save();
    console.log("✅ Super admin updated:", email);
  } else {
    console.log("🔹 Super admin not found, creating...");
    admin = new Staff({
      email,
      password, // plain text — pre-save hook will hash
      role: "admin",
      active: true,
    });
    await admin.save();
    console.log("✅ Super admin created:", email);
  }

  console.log("🎉 Done! Use these credentials to login:");
  console.log("Email:", email);
  console.log("Password:", password);

  mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
