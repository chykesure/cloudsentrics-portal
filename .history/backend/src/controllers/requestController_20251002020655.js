// controllers/requestController.js
const Request = require("../models/Request");
const axios = require("axios");

// Create new request (DB + Jira)
exports.createRequest = async (req, res) => {
  try {
    const {
      reporterName,
      reporterEmail,
      phone,
      company,
      accountId,
      bucketName,
      priority,
      awsAccounts,       // array: [{ alias, orgName }]
      acknowledgements,  // object: { charges: true, storage: true, confirm: true }
      title,
      description,
    } = req.body;

    // 1. Save to MongoDB
    const newRequest = new Request({
      reporterName,
      reporterEmail,
      phone,
      company,
      accountId,
      bucketName,
      priority,
      awsAccounts,
      acknowledgements,
      title,
      description,
    });
    await newRequest.save();

    // 2. Format description for Jira
    const awsAccountsText = awsAccounts && awsAccounts.length > 0
      ? awsAccounts.map((acc, i) =>
          `- Alias: ${acc.alias} | Org: ${acc.orgName}`
        ).join("\n")
      : "No additional AWS accounts requested";

    const acknowledgementsText = `
- CMYK/Lifecycle charges may apply: ${acknowledgements?.charges ? "✅" : "❌"}
- Data may be stored outside region: ${acknowledgements?.storage ? "✅" : "❌"}
- Information approved: ${acknowledgements?.confirm ? "✅" : "❌"}
    `;

    const jiraDescription = `
**Reporter:** ${reporterName} (${reporterEmail})
**Phone:** ${phone}
**Company:** ${company}
**Account ID:** ${accountId}
**Bucket Name:** ${bucketName}

**Title:** ${title}
**Description:** ${description}

**AWS Accounts Requested:**
${awsAccountsText}

**Acknowledgements:**
${acknowledgementsText}

**Priority:** ${priority}
**Date/Time:** ${new Date().toISOString()}
    `;

    // 3. Send to Jira
    const response = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: title,
          description: jiraDescription,
          issuetype: { name: "Task" },
        },
      },
      {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
      }
    );

    // 4. Save jiraIssueId back into DB
    newRequest.jiraIssueId = response.data.key;
    await newRequest.save();

    res.status(201).json({
      message: "Request created successfully",
      request: newRequest,
      jiraIssueKey: response.data.key,
    });

  } catch (error) {
    console.error("Error creating request:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create request", error: error.message });
  }
};
