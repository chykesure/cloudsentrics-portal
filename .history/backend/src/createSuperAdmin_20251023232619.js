// ensureSuperAdminAndFixActive.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel"); // adjust path if needed
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  // ---------- Step 1: Ensure Super Admin ----------
  let admin = await Staff.findOne({ email });

  if (admin) {
    admin.role = "admin";
    admin.active = true;
    if (!admin.password) {
      admin.password = await bcrypt.hash(password, 10);
    }
    await admin.save();
    console.log("✅ Super admin updated:", email);
  } else {
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

  // ---------- Step 2: Fix all staff missing 'active' ----------
  const result = await Staff.updateMany(
    { active: { $exists: false } },
    { $set: { active: true } }
  );
  console.log(`✅ Updated ${result.modifiedCount} staff to active=true`);

  mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
