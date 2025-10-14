const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin"); // adjust if your model path is different
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

async function resetPassword() {
  try {
    const hashed = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
    const result = await Admin.updateOne(
      { email: process.env.SUPER_ADMIN_EMAIL },
      { password: hashed }
    );
    console.log("✅ Super-admin password reset successfully:", result);
  } catch (err) {
    console.error("Error resetting password:", err);
  } finally {
    mongoose.disconnect();
  }
}

resetPassword();
