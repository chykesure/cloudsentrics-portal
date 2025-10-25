const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel"); // adjust path if needed
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  let admin = await Staff.findOne({ email });

  if (admin) {
    // ✅ Update existing staff
    admin.role = "admin";
    admin.active = true;
    if (!admin.password) {
      // If somehow password is missing, hash and set
      admin.password = await bcrypt.hash(password, 10);
    }
    await admin.save();
    console.log("Updated existing admin:", email);
  } else {
    // ✅ Create new admin
    const hashed = await bcrypt.hash(password, 10);
    admin = new Staff({
      email,
      password: hashed,
      role: "admin",
      active: true,
      lastLogin: null,
    });
    await admin.save();
    console.log("Created new admin:", email);
  }

  mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
