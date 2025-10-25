// resetSuperAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel"); // adjust path if needed
require("dotenv").config();

async function main() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = process.env.SUPER_ADMIN_EMAIL.toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  // Find existing super admin
  let admin = await Staff.findOne({ email });

  if (admin) {
    console.log("🔹 Super admin found, updating...");

    admin.role = "admin";
    admin.active = true;

    // Always rehash password from .env
    admin.password = await bcrypt.hash(password, 10);

    await admin.save();
    console.log("✅ Super admin updated:", email);
  } else {
    console.log("🔹 Super admin not found, creating...");

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
  }

  // Optional: Fix any staff missing `active` field
  const result = await Staff.updateMany(
    { active: { $exists: false } },
    { $set: { active: true } }
  );
  console.log(`✅ Updated ${result.modifiedCount} staff to active=true`);

  // Close connection
  mongoose.disconnect();
  console.log("🎉 Done! You can now login with the super admin credentials.");
}

main().catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});
