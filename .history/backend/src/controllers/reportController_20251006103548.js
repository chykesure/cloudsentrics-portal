// controllers/requestController.js

const Request = require("../models/Request");
const axios = require("axios");
const { sendEmail } = require("../services/emailService"); // Optional email

// -------------------- CREATE REQUEST --------------------
exports.createRequest = async (req, res) => {
  try {
    const data = req.body;

    // 1️⃣ Filter out empty or undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    // 2️⃣ Tier mapping
    const tierMap = {
      standard: { title: "STANDARD TIER", storage: "200GB" },
      business: { title: "BUSINESS TIER", storage: "400GB" },
      premium: { title: "PREMIUM TIER", storage: "2TB" },
    };
    const selectedTier = cleanData.selectedTier?.toLowerCase();
    const tierDetails = selectedTier ? tierMap[selectedTier] : null;

    // 3️⃣ Save to MongoDB
    const newRequest = new Request(cleanData);
    await newRequest.save();

    // 4️⃣ Build professional Jira description
    let jiraDescription = `**Reporter:** ${cleanData.reporterName || "N/A"} (${cleanData.reporterEmail || "N/A"})
**Phone:** ${cleanData.phone || "N/A"}
**Company:** ${cleanData.company || "N/A"}
**Account ID:** ${cleanData.accountId || "N/A"}
**Bucket Name:** ${cleanData.bucketName || "N/A"}
${tierDetails ? `**Tier:** ${tierDetails.title}\n**Storage:** ${tierDetails.storage}` : ""}
${cleanData.selectedStorageCount || cleanData.awsCountText ? `**Number of AWS Account(s) Needed:** ${cleanData.selectedStorageCount || cleanData.awsCountText}` : ""}
`;

    // AWS Accounts
    if (cleanData.awsAccounts?.length) {
      jiraDescription += `\nAWS Accounts\n`;
      cleanData.awsAccounts.forEach(a => {
        jiraDescription += `- Alias: ${a.alias} | Org: ${a.orgName}\n`;
      });
    }

    // Acknowledgements
    if (cleanData.acknowledgements?.length) {
      jiraDescription += `\nAcknowledgements\n`;
      cleanData.acknowledgements.forEach(a => {
        jiraDescription += `✅ ${a}\n`;
      });
    }

    // Change Requests (Step6)
    const changeEntries = [];
    if (cleanData.existingAccountId) changeEntries.push(`Existing Account ID: ${cleanData.existingAccountId}`);
    if (cleanData.existingStorageName) changeEntries.push(`Existing Storage Name: ${cleanData.existingStorageName}`);
    if (cleanData.changesRequested?.length) changeEntries.push(...cleanData.changesRequested.map(c => `Change: ${c}`));
    if (cleanData.details) changeEntries.push(`Additional Details: ${cleanData.details}`);
    if (changeEntries.length) {
      jiraDescription += `\nChange Requests\n`;
      changeEntries.forEach(entry => {
        jiraDescription += `- ${entry}\n`;
      });
    }

    // 5️⃣ Sync to Jira
    const jiraResp = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: cleanData.title || `Request from ${cleanData.reporterEmail}`,
          description: jiraDescription,
          issuetype: { name: "Task" },
          priority: { name: cleanData.priority || "Medium" },
        },
      },
      {
        auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_API_TOKEN },
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      }
    );

    // 6️⃣ Save Jira info in MongoDB
    newRequest.jiraIssueId = jiraResp.data.id;
    newRequest.jiraIssueKey = jiraResp.data.key;
    await newRequest.save();

    // ✅ Optional: Send confirmation email
    try {
      if (cleanData.reporterEmail) {
        const subject = `Cloudsentrics: Your request has been received (${newRequest.jiraIssueKey})`;
        const text = `Hi ${cleanData.reporterName || "User"},\n\nYour request has been logged successfully. You can track it using ID: ${newRequest.jiraIssueKey}\n\nThank you,\nCloudsentrics Support`;
        const html = `<p>Hi <strong>${cleanData.reporterName || "User"}</strong>,</p><p>Your request has been logged successfully. You can track it using ID: <strong>${newRequest.jiraIssueKey}</strong></p><p>Thank you,<br/>Cloudsentrics Support</p>`;
        await sendEmail(cleanData.reporterEmail, subject, text, html);
      }
    } catch (mailErr) {
      console.warn("⚠️ Failed to send email:", mailErr.message || mailErr);
    }

    res.status(201).json({
      message: "Request created and synced with Jira successfully",
      jiraIssueKey: jiraResp.data.key,
      request: newRequest,
    });
  } catch (error) {
    console.error("❌ Error creating request:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create request", error: error.response?.data || error.message });
  }
};

// -------------------- GET ALL REQUESTS --------------------
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    const enrichedRequests = await Promise.all(
      requests.map(async r => {
        let status = null;
        if (r.jiraIssueId) {
          try {
            const jira = await axios.get(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${r.jiraIssueId}`, {
              auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_API_TOKEN },
            });
            status = jira.data.fields.status.name;
          } catch (err) {
            console.warn(`⚠️ Could not fetch Jira issue ${r.jiraIssueId}`);
          }
        }
        return { ...r._doc, jiraStatus: status };
      })
    );
    res.json({ success: true, requests: enrichedRequests });
  } catch (err) {
    console.error("Error fetching requests:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- GET REQUEST BY ID --------------------
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ success: false, error: "Request not found" });
    res.json({ success: true, data: request });
  } catch (err) {
    console.error("Error fetching request:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- UPDATE REQUEST --------------------
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const request = await Request.findByIdAndUpdate(id, updatedData, { new: true });
    if (!request) return res.status(404).json({ success: false, error: "Request not found" });

    if (request.jiraIssueId) {
      try {
        // Rebuild Jira description on update
        let jiraDescription = `**Reporter:** ${request.reporterName || "N/A"} (${request.reporterEmail || "N/A"})\n`;
        jiraDescription += request.title ? `**Title:** ${request.title}\n` : "";
        jiraDescription += request.description ? `**Description:** ${request.description}\n` : "";
        // Add other fields similarly...
        await axios.put(
          `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${request.jiraIssueId}`,
          { fields: { summary: request.title || "Updated Request", description: jiraDescription } },
          {
            auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_API_TOKEN },
            headers: { Accept: "application/json", "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        console.warn(`⚠️ Jira update failed for ${request.jiraIssueId}:`, err.message);
      }
    }

    res.json({ success: true, request });
  } catch (err) {
    console.error("Error updating request:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- DELETE REQUEST --------------------
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ success: false, error: "Request not found" });

    await request.deleteOne();

    if (request.jiraIssueId) {
      try {
        await axios.delete(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${request.jiraIssueId}`, {
          auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_API_TOKEN },
        });
      } catch (err) {
        console.warn(`⚠️ Jira delete failed for ${request.jiraIssueId}:`, err.message);
      }
    }

    res.json({ success: true, message: "Request deleted successfully" });
  } catch (err) {
    console.error("Error deleting request:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
