const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding"); // ✅ Import added
const nodemailer = require("nodemailer");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword, name });

    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password, customerId } = req.body;

  if (!email || !customerId) {
    return res.status(400).json({ success: false, message: "Email and Customer ID are required" });
  }

  try {
    let user = await User.findOne({ email, customerId });
    let fromOnboarding = false;

    // If not found in Users, check Onboarding
    if (!user) {
      user = await Onboarding.findOne({
        "companyInfo.companyEmail": email,
        customerId: customerId
      });
      fromOnboarding = !!user;
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Only validate password for User model
    if (!fromOnboarding) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
    }

    // Generate JWT token
    const token = generateToken(user);

    // Prepare user data for response
    const userData = {
      id: user._id,
      email: user.email || user.companyInfo?.companyEmail,
      name: user.name || user.companyInfo?.primaryName || "User",
      customerId: user.customerId,
      type: fromOnboarding ? "onboarding" : "user"
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



// GET /api/auth/validate-account/:accountId
exports.validateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const record = await Onboarding.findOne({ customerId: accountId });

    if (!record) {
      return res.status(404).json({ valid: false, message: "Account not found" });
    }

    res.json({
      valid: true,
      companyName: record.companyInfo.companyName,
      companyEmail: record.companyInfo.companyEmail,
    });
  } catch (err) {
    console.error("Account validation error:", err);
    res.status(500).json({ valid: false, message: "Server error" });
  }
};

//Recovery of Customer ID
exports.recoverCustomerId = async (req, res) => {
  try {
    console.log("📩 Recover request body:", req.body);

    const { email } = req.body;
    const user = await Onboarding.findOne({ "companyInfo.companyEmail": email });

    if (!user) {
      console.log("❌ No user found for:", email);
      return res.status(404).json({ message: "Email not found" });
    }

    console.log("✅ User found:", user.companyInfo.companyName);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CloudSentric Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Customer ID Recovery",
      html: `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color:#f7f9fc; padding:40px 0;">
    <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.08); overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(90deg, #0047ab, #007bff); color:#ffffff; text-align:center; padding:30px 20px;">
        <img src="https://res.cloudinary.com/dqweh6zte/image/upload/v1730678019/cloudsentric_logo.png" alt="CloudSentric Logo" style="width:120px; margin-bottom:10px;">
        <h2 style="margin:0; font-weight:600; font-size:22px;">Customer ID Recovery</h2>
      </div>

      <!-- Body -->
      <div style="padding:30px; color:#333;">
        <p style="font-size:16px;">Dear <strong>${user.companyInfo?.primaryName || "Customer"}</strong>,</p>
        <p style="font-size:15px; line-height:1.6;">
          We received a request to recover your <strong>CloudSentric Customer ID</strong> 
          associated with your company account:
        </p>

        <div style="background-color:#f2f6fc; padding:15px; border-left:4px solid #007bff; border-radius:6px; margin:20px 0;">
          <p style="margin:0; font-size:16px;">
            <strong>Company:</strong> ${user.companyInfo?.companyName || "N/A"}<br/>
            <strong>Customer ID:</strong> 
            <span style="font-size:18px; font-weight:700; color:#0047ab;">${user.customerId}</span>
          </p>
        </div>

        <p style="font-size:15px; line-height:1.6;">
          If you did not request this recovery, please ignore this email or contact our 
          support team immediately to secure your account.
        </p>

        <p style="font-size:15px; margin-top:25px;">
          Warm regards,<br/>
          <strong>CloudSentric Support Team</strong><br/>
          <a href="mailto:support@cloudsentric.com" style="color:#007bff; text-decoration:none;">support@cloudsentric.com</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color:#f1f4f9; text-align:center; padding:15px; font-size:13px; color:#666;">
        © ${new Date().getFullYear()} CloudSentric Technologies. All rights reserved.<br/>
        <a href="https://cloudsentric.ng" style="color:#007bff; text-decoration:none;">Visit our website</a>
      </div>
    </div>
  </div>
`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Customer ID sent to your email" });
  } catch (error) {
    console.error("🔥 Error in recoverCustomerId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

