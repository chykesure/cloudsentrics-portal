const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin"); // ✅ Updated to Admin model
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

async function resetPassword() {
  try {
    const hashed = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

    const result = await Admin.updateOne(
      { email: process.env.SUPER_ADMIN_EMAIL, role: "admin" }, // ✅ use new role
      { password: hashed }
    );

    if (result.matchedCount === 0) {
      console.log("⚠ No admin found with that email. Creating one…");

      await Admin.create({
        email: process.env.SUPER_ADMIN_EMAIL,
        password: hashed,
        role: "admin"
      });

      console.log("✅ Default admin created successfully!");
    } else {
      console.log("✅ Admin password reset successfully!");
    }

  } catch (err) {
    console.error("❌ Error resetting password:", err);
  } finally {
    mongoose.disconnect();
  }
}

resetPassword();
