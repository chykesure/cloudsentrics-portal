// controllers/requestController.js
const Request = require("../models/Request");
const axios = require("axios");

exports.createRequest = async (req, res) => {
  try {
    const { reporterEmail, awsAccounts } = req.body;

    const safeReporterEmail = reporterEmail || "N/A";
    const safeAwsAccounts = Array.isArray(awsAccounts) ? awsAccounts : [];

    // Save to DB
    const newRequest = new Request({
      title: "Request",
      reporterEmail: safeReporterEmail,
      awsAccounts: safeAwsAccounts,
    });
    await newRequest.save();

    // Format description for Jira
    const awsAccountsText = safeAwsAccounts.length > 0
      ? safeAwsAccounts.map((acc, i) =>
          `- Alias: ${acc.alias} | Org: ${acc.orgName}`
        ).join("\n")
      : "No additional AWS accounts requested";

    const jiraDescription = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Reporter Email: ${safeReporterEmail}\nAWS Accounts Requested:\n${awsAccountsText}\nNumber of AWS Accounts: ${safeAwsAccounts.length}` }
          ]
        }
      ]
    };

    // Send to Jira
    const response = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: "Request",
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

    // Save Jira issue key in DB
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
