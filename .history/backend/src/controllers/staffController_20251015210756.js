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
// 🟢 CREATE new staff
exports.createStaff = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const exists = await Staff.findOne({ email });
        if (exists) return res.status(400).json({ message: "Staff already exists" });

        const newStaff = await Staff.create({ email, password, role });

        // 📧 Send welcome email
        const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;
        const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;">
        <h2>Welcome to Cloudsentrics Portal 🎉</h2>
        <p>Hi ${email.split("@")[0]},</p>
        <p>Your staff account has been created successfully. Here are your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Temporary Password:</strong> ${password}</li>
          <li><strong>Role:</strong> ${role}</li>
        </ul>
        <p>You can log in here: <a href="${loginUrl}">${loginUrl}</a></p>
        <p>Please change your password after first login.</p>
        <br/>
        <p>Regards,<br/><strong>Cloudsentrics Admin Team</strong></p>
      </div>
    `;

        await sendEmail(email, "Welcome to Cloudsentrics Portal", html);

        res.status(201).json({ message: "Staff created and email sent", staff: newStaff });
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
