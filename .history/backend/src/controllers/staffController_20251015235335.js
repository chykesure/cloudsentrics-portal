// src/controllers/staffController.js
const Staff = require("../models/staffModel");
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
exports.createStaff = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const exists = await Staff.findOne({ email });
        if (exists) return res.status(400).json({ message: "Staff already exists" });

        const newStaff = await Staff.create({ email, password, role });

        // 📧 Send welcome email
        // 📧 Send welcome email
        const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9fafb;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #032352;
      color: #fff;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #032352;
      font-size: 20px;
      margin-top: 0;
    }
    .details {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      list-style: none;
    }
    .details li {
      margin-bottom: 8px;
    }
    a.button {
      display: inline-block;
      background-color: #032352;
      color: #fff !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 15px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Cloudsentrics Portal 🎉</h1>
    </div>
    <div class="content">
      <h2>Hi ${email.split("@")[0]},</h2>
      <p>Your staff account has been created successfully. Here are your login details:</p>
      <ul class="details">
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Temporary Password:</strong> ${password}</li>
        <li><strong>Role:</strong> ${role}</li>
      </ul>
      <p>You can log in using the button below:</p>
      <a href="${loginUrl}" class="button">Login to Portal</a>
      <p style="margin-top: 20px;">Please change your password after first login for security.</p>
      <p>Best regards,<br/><strong>Cloudsentrics Admin Team</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Cloudsentrics. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

        const text = `
Hi ${email.split("@")[0]},

Your staff account has been created successfully.

Email: ${email}
Temporary Password: ${password}
Role: ${role}

Login here: ${loginUrl}

Please change your password after first login for security.

Best regards,
Cloudsentrics Admin Team
`;

        await sendEmail(email, "Welcome to Cloudsentrics Portal", text, html);


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
