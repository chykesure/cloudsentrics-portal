const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffModel");
require("dotenv").config();

async function fixAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "superadmin@mail.com";
  const password = "pass123";
  const hashed = await bcrypt.hash(password, 10);

  const admin = await Staff.findOneAndUpdate(
    { email },
    {
      $set: {
        password: hashed,   // ✅ correct password
        role: "admin",      // ✅ ensure correct role
        active: true        // ✅ ensure admin is active
      }
    },
    { new: true }
  );

  console.log("✅ Fixed Admin:", admin);
  process.exit();
}

fixAdmin();
