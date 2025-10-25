const mongoose = require("mongoose");
const Staff = require("./models/staff"); // adjust path if needed
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixActiveStatus = async () => {
  try {
    const result = await Staff.updateMany(
      { active: { $exists: false } }, // only staff missing 'active'
      { $set: { active: true } }
    );
    console.log("Updated staff records:", result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};

fixActiveStatus();
