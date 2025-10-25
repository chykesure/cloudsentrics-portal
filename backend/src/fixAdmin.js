const mongoose = require("mongoose");
const Staff = require("./models/staffModel"); // adjust path
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SUPER_ADMIN_EMAIL;

  const admin = await Staff.findOne({ email });
  if (!admin) {
    console.log("Super admin not found. Please run createAdmin.js first.");
    process.exit(0);
  }

  admin.role = "admin";
  admin.active = true;

  await admin.save();
  console.log("✅ Super admin role updated to admin and active");

  mongoose.disconnect();
}

main().catch(console.error);
