// fixRoles.js
const mongoose = require("mongoose");
const Staff = require("./models/staffModel");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Convert old roles
    await Staff.updateMany({ role: "super-admin" }, { role: "admin" });
    await Staff.updateMany({ role: "admin" }, { role: "readonly" });

    console.log("✅ Roles fixed successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
