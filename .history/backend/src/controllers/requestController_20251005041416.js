const Request = require("../models/Request");
const axios = require("axios");

/**
 * @desc Create a new Request and sync to Jira
 */
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
      title,
      description,
      awsAccounts,
      selectedStorageCount,
      bucketNote,
      awsCountText,
      accessList,
      step4Data,
      acknowledgements,
    } = req.body;

    // 1️⃣ Save data to MongoDB
    const newRequest = new Request({
      reporterName,
      reporterEmail,
      phone,
      company,
      accountId,
      bucketName,
      priority,
      title,
      description,
      awsAccounts,
      selectedStorageCount,
      bucketNote,
      awsCountText,
      accessList,
      step4Data,
      acknowledgements,
    });
    await newRequest.save();

    // 2️⃣ Build Jira ADF description
    const awsAccountsContent =
      awsAccounts && awsAccounts.length > 0
        ? awsAccounts.map((acc) => ({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `- Alias: ${acc.alias} | Org: ${acc.orgName}`,
              },
            ],
          }))
        : [
            {
              type: "paragraph",
              content: [{ type: "text", text: "No AWS accounts provided" }],
            },
          ];

    const accessListContent =
      accessList && accessList.length > 0
        ? accessList.map((user) => ({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `- ${user.fullName} (${user.email}) — Access: ${user.accessLevel}`,
              },
            ],
          }))
        : [
            {
              type: "paragraph",
              content: [{ type: "text", text: "No access list provided" }],
            },
          ];

    const step4Content = step4Data
      ? [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `File Sharing: ${step4Data.fileSharing || "N/A"}`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Lifecycle Policy: ${step4Data.lifecycle || "N/A"}`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Retention: ${step4Data.retentionDays || "0"} days, ${
                  step4Data.retentionMonths || "0"
                } months`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Transition: Glacier=${step4Data.transitionGlacier}, Standard=${step4Data.transitionStandard}`,
              },
            ],
          },
        ]
      : [
          {
            type: "paragraph",
            content: [{ type: "text", text: "No step4 configuration provided" }],
          },
        ];

    const ackContent =
      acknowledgements && acknowledgements.length > 0
        ? acknowledgements.map((ack) => ({
            type: "paragraph",
            content: [{ type: "text", text: `✅ ${ack}` }],
          }))
        : [
            {
              type: "paragraph",
              content: [{ type: "text", text: "No acknowledgements" }],
            },
          ];

    const jiraDescriptionADF = {
      type: "doc",
      version: 1,
      content: [
        // Reporter details
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Reporter: ${reporterName || "N/A"}` },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Email: ${reporterEmail || "N/A"}` },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Company: ${company || "N/A"}` },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Phone: ${phone || "N/A"}` },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Account ID: ${accountId || "N/A"}` },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Bucket: ${bucketName || "N/A"}` },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Priority: ${priority || "N/A"}` },
          ],
        },

        // Basic title & description
        {
          type: "paragraph",
          content: [{ type: "text", text: `Title: ${title}` }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: `Description: ${description}` }],
        },

        // AWS and storage info
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `Selected Storage Count: ${
                selectedStorageCount || "N/A"
              }`,
            },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "AWS Accounts:" }],
        },
        ...awsAccountsContent,
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Bucket Note: ${bucketNote || "None"}` },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: `AWS Count Text: ${awsCountText || "None"}` },
          ],
        },

        // Access control
        {
          type: "paragraph",
          content: [{ type: "text", text: "Access List:" }],
        },
        ...accessListContent,

        // Step4 config
        {
          type: "paragraph",
          content: [{ type: "text", text: "Storage Configuration (Step4):" }],
        },
        ...step4Content,

        // Acknowledgements
        {
          type: "paragraph",
          content: [{ type: "text", text: "Acknowledgements:" }],
        },
        ...ackContent,

        // Footer
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Created At: ${new Date().toISOString()}` },
          ],
        },
      ],
    };

    // 3️⃣ Send to Jira
    const response = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: title || "AWS Request Submission",
          description: jiraDescriptionADF,
          issuetype: { name: "Task" },
          priority: { name: priority || "Medium" },
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

    // 4️⃣ Update Jira info
    newRequest.jiraIssueId = response.data.id;
    newRequest.jiraIssueKey = response.data.key;
    await newRequest.save();

    res.status(201).json({
      message: "Request created and synced with Jira successfully",
      request: newRequest,
      jiraKey: response.data.key,
    });
  } catch (error) {
    console.error("Error creating request:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create request",
      error: error.response?.data || error.message,
    });
  }
};
