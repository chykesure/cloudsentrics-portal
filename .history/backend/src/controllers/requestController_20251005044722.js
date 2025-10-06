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
      selectedTier, // ✅ Step2
      awsAccounts,
      selectedStorageCount,
      bucketNote,
      awsCountText,
      accessList,
      step4Data,
      acknowledgements,
    } = req.body;

    // Map of all tier details
    const tierDetailsMap = {
      standard: {
        title: "STANDARD TIER",
        storage: "200GB",
        channels: ["Dashboard", "Email"],
        response: "Within 24 hrs",
        availability: "24/7 support coverage",
        extras: "Access to knowledge base & FAQs",
      },
      business: {
        title: "BUSINESS TIER",
        storage: "400GB",
        channels: ["Dashboard", "Live Chat (App/Web)", "WhatsApp"],
        response: "Within 12 hrs",
        availability: "24/7 support coverage",
        extras: "Knowledge base + Priority email support",
      },
      premium: {
        title: "PREMIUM TIER",
        storage: "2TB",
        channels: ["Dashboard", "Email", "Live Chat", "Phone", "WhatsApp"],
        response: "Within 2 hrs",
        availability: "24/7 dedicated support",
        extras: "All features + VIP onboarding assistance",
      },
    };

    // Get selected tier info dynamically
    const selectedTierInfo =
      tierDetailsMap[selectedTier?.toLowerCase()] || {
        title: selectedTier || "N/A",
        storage: "N/A",
        channels: [],
        response: "N/A",
        availability: "N/A",
        extras: "N/A",
      };

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
      selectedTier, // ✅ include tier
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
                text: `File Options: ${
                  step4Data.fileOptions?.join(", ") || "None"
                }`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `OTP Plan: ${
                  Object.entries(step4Data.otpPlan || {})
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ") || "N/A"
                }`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Custom OTP: ${
                  Object.entries(step4Data.customOtp || {})
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ") || "N/A"
                }`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Lifecycle: ${step4Data.lifecycle || "N/A"}`,
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

    // Build Jira ADF
    const jiraDescriptionADF = {
      type: "doc",
      version: 1,
      content: [
        { type: "paragraph", content: [{ type: "text", text: `Reporter: ${reporterName || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Email: ${reporterEmail || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Company: ${company || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Phone: ${phone || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Account ID: ${accountId || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Bucket: ${bucketName || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Priority: ${priority || "N/A"}` }] },

        // ✅ Dynamic Tier Details
        { type: "paragraph", content: [{ type: "text", text: `Tier (Step2): ${selectedTierInfo.title}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Storage: ${selectedTierInfo.storage}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Channels: ${selectedTierInfo.channels.join(", ") || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Response Time: ${selectedTierInfo.response}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Availability: ${selectedTierInfo.availability}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Extras: ${selectedTierInfo.extras}` }] },

        { type: "paragraph", content: [{ type: "text", text: `Title: ${title}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Description: ${description}` }] },

        { type: "paragraph", content: [{ type: "text", text: `Selected Storage Count: ${selectedStorageCount || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: "AWS Accounts:" }] },
        ...awsAccountsContent,

        { type: "paragraph", content: [{ type: "text", text: `Bucket Note: ${bucketNote || "None"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `AWS Count Text: ${awsCountText || "None"}` }] },

        { type: "paragraph", content: [{ type: "text", text: "Access List:" }] },
        ...accessListContent,

        { type: "paragraph", content: [{ type: "text", text: "Storage Configuration (Step4):" }] },
        ...step4Content,

        { type: "paragraph", content: [{ type: "text", text: "Acknowledgements:" }] },
        ...ackContent,

        { type: "paragraph", content: [{ type: "text", text: `Created At: ${new Date().toISOString()}` }] },
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
