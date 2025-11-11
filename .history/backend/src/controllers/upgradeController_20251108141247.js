const UpgradeRequest = require("../models/UpgradeRequest");
const Onboarding = require("../models/Onboarding");
const Request = require("../models/Request"); // ✅ add this line
const nodemailer = require("nodemailer");

const getUserUpgradeStatus = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) return res.status(400).json({ message: "Email required" });

    const currentRequest = await Request.findOne({ reporterEmail: email })
      .sort({ updatedAt: -1 })
      .lean();

    const pendingUpgrade = await UpgradeRequest.findOne({ email, status: "pending" })
      .sort({ timestamp: -1 })
      .lean();

    const lastRequest = await UpgradeRequest.findOne({ email })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      currentTier: currentRequest?.selectedTier || null,
      pendingRequest: pendingUpgrade || null,
      lastRequest: lastRequest || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// 📦 Create Upgrade Request
const requestUpgrade = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      previousTier,
      newTier,
      previousStorage,
      newStorage,
      status,
      timestamp,
      companyEmail, // optional: include for template
    } = req.body;

    console.log("🟩 Incoming Upgrade Request Payload:", req.body);

    // ✅ Validate required fields
    if (!email || !newTier || !newStorage || !previousTier || !previousStorage) {
      console.error("❌ Missing required fields:", {
        email,
        newTier,
        newStorage,
        previousTier,
        previousStorage,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Ensure all tier and storage info are provided.",
      });
    }


    // ✅ Prevent duplicate pending or in-review requests
    const existingRequest = await UpgradeRequest.findOne({
      email,
      status: { $in: ["pending", "in-review"] },
    });

    if (existingRequest) {
      console.warn("⚠️ Duplicate pending request found for:", email);
      return res.status(409).json({
        success: false,
        message: `You already have a ${existingRequest.status} upgrade request from ${existingRequest.previousTier} to ${existingRequest.newTier}. Please wait for approval before submitting another.`,
        existing: {
          previousTier: existingRequest.previousTier,
          newTier: existingRequest.newTier,
          date: existingRequest.timestamp,
          status: existingRequest.status,
        },
      });
    }


    // ✅ Fetch companyName directly from Onboarding
    const companyInfo = await Onboarding.findOne({ "companyInfo.companyEmail": email, });
    const companyName = companyInfo?.companyInfo?.companyName || "User";


    // ✅ Create new upgrade request
    const newRequest = new UpgradeRequest({
      userId: userId || "N/A",
      fullName: fullName || "N/A",
      email,
      previousTier,
      newTier,
      previousStorage,
      newStorage,
      status: status || "pending",
      timestamp: timestamp || new Date(),
    });

    await newRequest.save();
    console.log("✅ Upgrade request saved successfully:", newRequest._id);

    // ✅ Styled Email for Upgrade Request
    if (email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.hostinger.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "📨 Your Storage Upgrade Request is Received",
          html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #032352;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
          }
          .content {
            padding: 30px 25px;
            color: #333333;
            line-height: 1.6;
          }
          .content h2 {
            color: #032352;
            font-size: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            background-color: #032352;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .footer {
            background-color: #f4f6f8;
            color: #888888;
            font-size: 12px;
            padding: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cloud Sentrics</h1>
          </div>
          <div class="content">
            <h2>Hi ${companyName},</h2>
            <p>We have received your request to upgrade your storage plan:</p>
            <ul>
              <li><b>Current Tier:</b> ${previousTier} (${previousStorage})</li>
              <li><b>Requested Tier:</b> ${newTier} (${newStorage})</li>
            </ul>
            <p>Your request is currently <b>pending review</b>. You will be notified once it is processed.</p>
            <a href="https://onboardingportal.cloudsentrics.org/" class="button">Visit Cloud Sentrics Portal</a>
          </div>
          <div class="footer">
            Cloud Sentrics Support Team<br>
            Securing Tomorrow, One Cloud at a Time<br>
            🌐 www.cloudsentrics.org
          </div>
        </div>
      </body>
      </html>
      `,
        });

        console.log("📧 Styled upgrade request email sent to:", email);

        // ✅ Send notification to Admin
        const adminEmail = process.env.ADMIN_EMAIL;
        await transporter.sendMail({
          from: `"Cloud Sentrics Portal" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
          subject: "📩 New Storage Upgrade Request Awaiting Approval",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Upgrade Request</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#333;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f2f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#032352;padding:30px 20px;text-align:center;">
              <img src="https://cloudsentrics.org/assets/logo.png" alt="Cloud Sentrics" width="120" style="margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-size:22px;">Cloud Sentrics Admin Alert</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 40px;">
              <p style="font-size:15px;margin-bottom:15px;">Hello Admin,</p>
              <p style="font-size:15px;margin-bottom:25px;">
                A customer has submitted a storage upgrade request that requires your review and action.
              </p>

              <p style="font-size:15px;margin-bottom:25px;">
                Please log in to the Admin Portal to review this request.
Once reviewed, select either Approve or Reject to complete the action.

Kindly take prompt action so the customer can be notified automatically of the decision.
              </p>
              
              <p style="font-size:15px;margin-bottom:25px;">
                Thank you for your attention.
              </p>

              <div style="text-align:center;margin-top:30px;">
                <a href="https://onboardingportal.cloudsentrics.org/admin/login"
                   style="display:inline-block;background:#032352;color:#fff;text-decoration:none;padding:12px 24px;
                          border-radius:6px;font-weight:600;letter-spacing:0.3px;">
                  🔍 Review Request
                </a>
              </div>

              <p style="font-size:14px;color:#555;margin-top:30px;line-height:1.6;">
                Please log in to the <a href="https://onboardingportal.cloudsentrics.org/admin/login" style="color:#032352;font-weight:500;">Admin Portal</a>
                to review and take action. Once reviewed, you can <strong>Approve</strong> or <strong>Reject</strong> the request.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafc;text-align:center;padding:25px;color:#888;font-size:12px;">
              <p style="margin:0;">© ${new Date().getFullYear()} Cloud Sentrics • All rights reserved</p>
              <p style="margin:6px 0 0;">Automated Notification from Cloud Sentrics Portal</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
        });


        console.log(`📨 Admin notification sent to: ${adminEmail}`);
      } catch (emailError) {
        console.error("⚠️ Email notification failed:", emailError.message);
      }
    }


    // ✅ Success response
    res.status(201).json({
      success: true,
      message: "Upgrade request submitted successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Upgrade Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing upgrade request.",
      error: error.message,
    });
  }
};



// 📨 Get All Upgrade Requests (Admin)
const getAllUpgrades = async (req, res) => {
  try {
    const requests = await UpgradeRequest.find().sort({ timestamp: -1 }).lean();

    // 🔍 Attach companyName from nested onboarding.companyInfo
    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const onboard = await Onboarding.findOne({
          "companyInfo.companyEmail": req.email,
        }).lean();

        return {
          ...req,
          companyName: onboard?.companyInfo?.companyName || req.fullName || "N/A", // ✅ fallback logic
        };
      })
    );

    res.json(enrichedRequests);
  } catch (error) {
    console.error("Error fetching upgrade requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Approve Upgrade
const approveUpgrade = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find the upgrade request
    const upgradeRequest = await UpgradeRequest.findById(id);
    if (!upgradeRequest) {
      return res.status(404).json({ message: "Upgrade request not found" });
    }

    const companyInfo = await Onboarding.findOne({ "companyInfo.companyEmail": upgradeRequest.email, });
    const companyName = companyInfo?.companyInfo?.companyName || "User";

    // 2️⃣ Mark as approved and store approval datetime
    upgradeRequest.status = "approved";
    upgradeRequest.approvedAt = new Date(); // ✅ record exact approval time
    await upgradeRequest.save();


    // 3️⃣ Update tier details in the Request table
    const updatedRequest = await Request.findOneAndUpdate(
      { reporterEmail: upgradeRequest.email }, // ✅ fixed filter
      {
        $set: {
          tierTitle: upgradeRequest.newTier || upgradeRequest.tierTitle,
          tierStorage: upgradeRequest.newStorage || upgradeRequest.tierStorage,
          selectedTier: upgradeRequest.newTier || upgradeRequest.selectedTier,
          selectedStorageCount: 1,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedRequest) {
      console.warn(`⚠️ No Request found for ${upgradeRequest.email}`);
    }

    // 4️⃣ Sync onboarding progress
    await Onboarding.findOneAndUpdate(
      { email: upgradeRequest.email },
      { $set: { currentTier: upgradeRequest.newTier || upgradeRequest.selectedTier } },
      { new: true }
    );

    // 5️⃣ Send approval email via Hostinger SMTP
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
      from: process.env.EMAIL_USER,
      to: upgradeRequest.email,
      subject: "✅ Your Storage Upgrade Has Been Approved",
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .header {
        background-color: #28a745;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 30px 25px;
        color: #333333;
        line-height: 1.6;
      }
      .content h2 {
        color: #28a745;
        font-size: 20px;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        margin-top: 20px;
        background-color: #032352;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      }
      .footer {
        background-color: #f4f6f8;
        color: #888888;
        font-size: 12px;
        padding: 20px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Cloud Sentrics</h1>
      </div>
      <div class="content">
        <h2>Hi ${companyName},</h2>
        <p>We’re excited to inform you that your storage upgrade request has been <b>approved</b>!</p>
        <ul>
          <li><b>New Tier:</b> ${upgradeRequest.newTier}</li>
          <li><b>Storage Capacity:</b> ${upgradeRequest.newStorage}</li>
        </ul>
        <p>Your new storage tier is now active. You can refresh your Cloud Sentrics Portal to see the updated capacity.</p>
        <a href="https://onboardingportal.cloudsentrics.org/" class="button">Go to Portal</a>
      </div>
      <div class="footer">
        Cloud Sentrics Support Team<br>
        Securing Tomorrow, One Cloud at a Time<br>
        🌐 www.cloudsentrics.org
      </div>
    </div>
  </body>
  </html>
  `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Approval email sent to: ${upgradeRequest.email}`);


    console.log(`✅ Approved upgrade for ${upgradeRequest.email}`);
    console.log(`📦 Updated Request table with ${upgradeRequest.newTier} (${upgradeRequest.newStorage})`);

    res.status(200).json({
      success: true,
      message: "Upgrade approved and Request table updated successfully",
      updatedRequest,
    });
  } catch (error) {
    console.error("❌ Approve Upgrade Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// ❌ Deny Upgrade
const denyUpgrade = async (req, res) => {
  try {
    const { id } = req.params;
    const upgrade = await UpgradeRequest.findById(id);

    if (!upgrade) {
      return res.status(404).json({ message: "Upgrade request not found" });
    }

    const companyInfo = await Onboarding.findOne({ "companyInfo.companyEmail": upgrade.email, });
    const companyName = companyInfo?.companyInfo?.companyName || "User";


    // ✅ Mark upgrade as rejected
    upgrade.status = "rejected";
    await upgrade.save();


    // ✅ Notify user if email exists
    if (upgrade.email && upgrade.email !== "N/A") {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: upgrade.email,
        subject: "❌ Update on Your Storage Upgrade Request",
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #dc3545;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
        }
        .content {
          padding: 30px 25px;
          color: #333333;
          line-height: 1.6;
        }
        .content h2 {
          color: #dc3545;
          font-size: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          margin-top: 20px;
          background-color: #032352;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          background-color: #f4f6f8;
          color: #888888;
          font-size: 12px;
          padding: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Cloud Sentrics</h1>
        </div>
        <div class="content">
          <h2>Hi ${companyName},</h2>
          <p>We regret to inform you that your request to upgrade your storage plan has been <b>denied</b>.</p>
          <p>This may be due to incomplete billing verification or other administrative reasons. Please reach out to 
          <a href="mailto:customersupport@cloudsentrics.org">customersupport@cloudsentrics.org</a> for clarification or assistance.</p>
          <p>Thank you for your understanding and continued trust in Cloud Sentrics.</p>
          <a href="https://onboardingportal.cloudsentrics.org/" class="button">Visit Portal</a>
        </div>
        <div class="footer">
          Cloud Sentrics Support Team<br>
          Securing Tomorrow, One Cloud at a Time<br>
          🌐 www.cloudsentrics.org
        </div>
      </div>
    </body>
    </html>
    `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Denial email sent to: ${upgrade.email}`);
    }


    res.json({ message: "Upgrade denied successfully", data: upgrade });
  } catch (error) {
    console.error("Deny Upgrade Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// 📨 Get Upgrade Request by Email
const getUpgradeByEmail = async (req, res) => {
  try {
    // Accept both param or query
    const email = req.params.email || req.query.email || req.query.reporterEmail;

    console.log("📩 Fetching upgrade request for:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the most recent request for this email
    const request = await UpgradeRequest.findOne({ email })
      .sort({ submittedAt: -1 })
      .lean();

    if (!request) {
      console.warn("❌ No upgrade request found for:", email);
      return res.json({ status: "None", data: null });
    }

    // Always return a consistent structure
    res.json({
      status: request.status || "None",
      data: request,
    });
  } catch (error) {
    console.error("Get Upgrade By Email Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// controllers/upgradeController.js
const getRequestByEmail = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) return res.status(400).json({ message: "Email required" });

    const request = await Request.findOne({ reporterEmail: email }).sort({ updatedAt: -1 }).lean();

    if (!request) return res.json({ status: "None", data: null });

    res.json({
      status: "found",
      data: request,
    });
  } catch (error) {
    console.error("Get Request by Email Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  requestUpgrade,
  getAllUpgrades,
  approveUpgrade,
  denyUpgrade,
  getUserUpgradeStatus,
  getUpgradeByEmail, // 👈 add this line
  getRequestByEmail,
};

