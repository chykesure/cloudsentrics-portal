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

    // 1. Validate title (Jira summary)
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required for Jira issue summary." });
    }

    // 2. Save to MongoDB
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

    // 3. Prepare Jira description in Atlassian Document Format (ADF)
    const awsAccountsText = awsAccounts && awsAccounts.length > 0
      ? awsAccounts.map(acc => `- Alias: ${acc.alias} | Org: ${acc.orgName}`).join("\n")
      : "No additional AWS accounts requested";

    const acknowledgementsText = `
- CMYK/Lifecycle charges may apply: ${acknowledgements?.charges ? "✅" : "❌"}
- Data may be stored outside region: ${acknowledgements?.storage ? "✅" : "❌"}
- Information approved: ${acknowledgements?.confirm ? "✅" : "❌"}
`;

    const fullDescriptionText = `
Reporter: ${reporterName || "N/A"} (${reporterEmail || "N/A"})
Phone: ${phone || "N/A"}
Company: ${company || "N/A"}
Account ID: ${accountId || "N/A"}
Bucket Name: ${bucketName || "N/A"}

Title: ${title}
Description: ${description || "N/A"}

AWS Accounts Requested:
${awsAccountsText}

Acknowledgements:
${acknowledgementsText}

Priority: ${priority || "N/A"}
Date/Time: ${new Date().toISOString()}
`;

    // Convert text lines to ADF paragraphs
    const jiraDescription = {
      type: "doc",
      version: 1,
      content: fullDescriptionText
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => ({
          type: "paragraph",
          content: [{ type: "text", text: line }],
        })),
    };

    // 4. Send to Jira
    const response = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: title.trim(),
          description: jiraDescription,
          issuetype: { name: "Task" },
        },
      },
      {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // 5. Save Jira Issue Key back to DB
    newRequest.jiraIssueId = response.data.key;
    await newRequest.save();

    res.status(201).json({
      message: "Request created successfully",
      request: newRequest,
      jiraIssueKey: response.data.key,
    });

  } catch (error) {
    console.error("Error creating request:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create request",
      error: error.response?.data || error.message,
    });
  }
};
