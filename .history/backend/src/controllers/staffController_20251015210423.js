// src/controllers/staffController.js
const Staff = require("../models/staffModel");

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
exports.createStaff = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ message: "Staff already exists" });

    const newStaff = await Staff.create({ email, password, role });
    res.status(201).json({ message: "Staff created successfully", staff: newStaff });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
