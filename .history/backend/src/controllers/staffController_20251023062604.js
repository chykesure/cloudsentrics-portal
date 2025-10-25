// src/controllers/staffController.js
//const Staff = require("../models/staffModel");
const Staff = require("../models/Admin");
//const Staff = require("../models/adminModel");
const { sendEmail } = require("../services/emailService");

// 🟢 GET all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 CREATE new staff
// 🟢 CREATE new staff (Auto-generate password)
exports.createStaff = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Check if staff already exists
    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ message: "Staff already exists" });

    // ✅ Auto-generate random secure password
    const tempPassword = Math.random().toString(36).slice(-10) + "A!1";

    // ✅ Hash password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ Create staff with forced password reset
    const newStaff = await Staff.create({
      email,
      role,
      password: hashedPassword,
      passwordChangeRequired: true,
      active: true,
    });

    // ✅ Send login details via email
    const loginUrl = `${process.env.FRONTEND_URL || "https://onboardingportal.cloudsentrics.org"}/login`;

    const html = `
      <h2>Welcome to Cloudsentrics Portal 🎉</h2>
      <p>Your staff account has been created successfully.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p><small>Please change your password after first login.</small></p>
      <a href="${loginUrl}">Login Now</a>
    `;

    await sendEmail(email, "Your Temporary Login Credentials", html);

    res.status(201).json({
      message: "Staff created successfully. A temporary password has been emailed.",
      staff: {
        _id: newStaff._id,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (err) {
    console.error("Error creating staff:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 🟢 UPDATE staff info
exports.updateStaff = async (req, res) => {
  try {
    const { email, role } = req.body;
    const updated = await Staff.findByIdAndUpdate(
      req.params.id,
      { email, role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff updated", staff: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 DELETE staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 TOGGLE active/inactive
exports.toggleStaffActive = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    staff.active = !staff.active;
    await staff.save();
    res.json({ message: `Staff ${staff.active ? "activated" : "deactivated"}`, staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
