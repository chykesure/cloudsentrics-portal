// controllers/requestController.js
const Request = require("../models/Request");
const axios = require("axios");

exports.createRequest = async (req, res) => {
  try {
    const { title, reporterEmail, awsAccounts, acknowledgements } = req.body;

    // 1. Save to MongoDB
    const newRequest = new Request({
      title,
      reporterEmail,
      awsAccounts,
      acknowledgements,
    });
    await newRequest.save();

    // 2. Format description for Jira
    const awsAccountsText =
      awsAccounts && awsAccounts.length > 0
        ? awsAccounts.map((acc) => `- Alias: ${acc.alias} | Org: ${acc.orgName}`).join("\n")
        : "No AWS accounts requested";

    const acknowledgementsText = acknowledgements
      ? acknowledgements
          .map((ack) => `- ${ack} ✅`)
          .join("\n")
      : "No acknowledgements";

    const jiraDescription = `
**Reporter Email:** ${reporterEmail}
**Title:** ${title}

**AWS Accounts Requested:**
${awsAccountsText}

**Acknowledgements:**
${acknowledgementsText}

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
