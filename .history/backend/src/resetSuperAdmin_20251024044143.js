const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SUPER_ADMIN_EMAIL.toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  let admin = await Staff.findOne({ email });

  if (admin) {
    admin.role = "admin";
    admin.active = true;
    admin.password = await bcrypt.hash(password, 10); // always hash
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

  mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
