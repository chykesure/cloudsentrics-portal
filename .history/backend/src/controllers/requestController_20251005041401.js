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
    const makeParagraph = (text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    });

    const awsAccountsContent =
      awsAccounts?.length > 0
        ? awsAccounts.map(
            (acc) => makeParagraph(`- Alias: ${acc.alias} | Org: ${acc.orgName}`)
          )
        : [makeParagraph("No AWS accounts provided")];

    const accessListContent =
      accessList?.length > 0
        ? accessList.map(
            (user) =>
              makeParagraph(
                `- ${user.fullName} (${user.email}) — Access: ${user.accessLevel}`
              )
          )
        : [makeParagraph("No access list provided")];

    const step4Content = step4Data
      ? [
          makeParagraph(`File Sharing: ${step4Data.fileSharing || "N/A"}`),
          makeParagraph(`Lifecycle Policy: ${step4Data.lifecycle || "N/A"}`),
          makeParagraph(
            `Retention: ${step4Data.retentionDays || "0"} days, ${
              step4Data.retentionMonths || "0"
            } months`
          ),
          makeParagraph(
            `Transition: Glacier=${step4Data.transitionGlacier}, Standard=${step4Data.transitionStandard}`
          ),
        ]
      : [makeParagraph("No step4 configuration provided")];

    const ackContent =
      acknowledgements?.length > 0
        ? acknowledgements.map((ack) => makeParagraph(`✅ ${ack}`))
        : [makeParagraph("No acknowledgements")];

    const jiraDescriptionADF = {
      type: "doc",
      version: 1,
      content: [
        makeParagraph(`Reporter: ${reporterName || "N/A"}`),
        makeParagraph(`Email: ${reporterEmail || "N/A"}`),
        makeParagraph(`Company: ${company || "N/A"}`),
        makeParagraph(`Phone: ${phone || "N/A"}`),
        makeParagraph(`Account ID: ${accountId || "N/A"}`),
        makeParagraph(`Bucket: ${bucketName || "N/A"}`),
        makeParagraph(`Priority: ${priority || "N/A"}`),
        makeParagraph(`Title: ${title || "N/A"}`),
        makeParagraph(`Description: ${description || "N/A"}`),

        makeParagraph(`Selected Storage Count: ${selectedStorageCount || "N/A"}`),
        makeParagraph("AWS Accounts:"),
        ...awsAccountsContent,
        makeParagraph(`Bucket Note: ${bucketNote || "None"}`),
        makeParagraph(`AWS Count Text: ${awsCountText || "None"}`),

        makeParagraph("Access List:"),
        ...accessListContent,

        makeParagraph("Storage Configuration (Step4):"),
        ...step4Content,

        makeParagraph("Acknowledgements:"),
        ...ackContent,

        makeParagraph(`Created At: ${new Date().toISOString()}`),
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

    // 4️⃣ Update Jira info in DB
    newRequest.jiraIssueId = response.data.id;
    newRequest.jiraIssueKey = response.data.key;
    await newRequest.save();

    res.status(201).json({
      message: "✅ Request created and synced with Jira successfully",
      request: newRequest,
      jiraKey: response.data.key,
    });
  } catch (error) {
    console.error("❌ Error creating request:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create request",
      error: error.response?.data || error.message,
    });
  }
};
