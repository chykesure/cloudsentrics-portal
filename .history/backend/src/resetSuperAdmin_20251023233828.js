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

  // Find the super admin
  let admin = await Staff.findOne({ email });

  if (!admin) {
    console.log("Super admin not found. Creating a new admin...");

    const hashedPassword = await bcrypt.hash(password, 10);
    admin = new Staff({
      email,
      password: hashedPassword,
      role: "admin",
      active: true,
      lastLogin: null,
    });

    await admin.save();
    console.log("✅ Super admin created successfully:", email);
  } else {
    // Update existing super admin
    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    admin.role = "admin";
    admin.active = true;
    await admin.save();
    console.log("✅ Super admin password reset and role updated:", email);
  }

  mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
