const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel"); // adjust path
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD; // new password you want

  const admin = await Staff.findOne({ email });
  if (!admin) {
    console.log("Super admin not found. Please run createAdmin.js first.");
    process.exit(0);
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);
  admin.password = hashedPassword;
  admin.role = "admin";      // ensure role is correct
  admin.active = true;       // ensure active
  await admin.save();

  console.log(`✅ Super admin password reset successfully for ${email}`);
  mongoose.disconnect();
}

main().catch(console.error);
