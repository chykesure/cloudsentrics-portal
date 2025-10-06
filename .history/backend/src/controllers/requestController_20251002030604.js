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

    // 2. Build Jira ADF description
    const awsContent = awsAccounts && awsAccounts.length > 0
      ? awsAccounts.map(acc => ({
          type: "paragraph",
          content: [
            { type: "text", text: `- Alias: ${acc.alias} | Org: ${acc.orgName}` }
          ]
        }))
      : [
          {
            type: "paragraph",
            content: [{ type: "text", text: "No AWS accounts requested" }]
          }
        ];

    const ackContent = acknowledgements && acknowledgements.length > 0
      ? acknowledgements.map(ack => ({
          type: "paragraph",
          content: [{ type: "text", text: `- ${ack} ✅` }]
        }))
      : [
          {
            type: "paragraph",
            content: [{ type: "text", text: "No acknowledgements" }]
          }
        ];

    const jiraDescriptionADF = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: `Reporter Email: ${reporterEmail}` }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: `Title: ${title}` }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "AWS Accounts Requested:" }]
        },
        ...awsContent,
        {
          type: "paragraph",
          content: [{ type: "text", text: "Acknowledgements:" }]
        },
        ...ackContent,
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Date/Time: ${new Date().toISOString()}` }
          ]
        }
      ]
    };

    // 3. Send to Jira
    const response = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: title,
          description: jiraDescriptionADF,
          issuetype: { name: "Task" },
        },
      },
      {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
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
    console.error(
      "Error creating request:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to create request",
      error: error.response?.data || error.message,
    });
  }
};
