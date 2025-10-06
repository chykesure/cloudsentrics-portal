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
      selectedTier,
      tierDetails, // ✅ Accept from frontend if provided
      awsAccounts,
      selectedStorageCount,
      bucketNote,
      awsCountText,
      accessList,
      step4Data,
      acknowledgements,
      existingAccountId,
      existingStorageName,
      changesRequested,
      details,
    } = req.body;

    // 1️⃣ Safe defaults
    const reporterNameFinal = reporterName || "Unknown Reporter";
    const reporterEmailFinal = reporterEmail || "unknown@example.com";
    const phoneFinal = phone || "N/A";
    const companyFinal = company || "N/A";
    const accountIdFinal = accountId || "N/A";
    const bucketNameFinal = bucketName || "N/A";
    const priorityFinal = priority || "Medium";
    const selectedTierFinal = selectedTier?.toLowerCase() || "standard";
    const titleFinal = title || `Request from ${reporterEmailFinal}`;
    const descriptionFinal = description || "No description provided";

    // 2️⃣ Tier details map (for defaults)
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

    // 🧠 If frontend sends tierDetails (like 1TB plan), use that directly
    let selectedTierInfo;
    if (tierDetails && tierDetails.title && tierDetails.storage) {
      selectedTierInfo = tierDetails;
    } else {
      selectedTierInfo = tierDetailsMap[selectedTierFinal] || {
        title: `CUSTOM TIER (${selectedTierFinal.toUpperCase()})`,
        storage: selectedTierFinal,
        channels: ["Dashboard"],
        response: "Varies",
        availability: "Based on configuration",
        extras: "Custom storage plan",
      };
    }

    // 3️⃣ Save to MongoDB
    const newRequest = new Request({
      reporterName: reporterNameFinal,
      reporterEmail: reporterEmailFinal,
      phone: phoneFinal,
      company: companyFinal,
      accountId: accountIdFinal,
      bucketName: bucketNameFinal,
      priority: priorityFinal,
      title: titleFinal,
      description: descriptionFinal,
      selectedTier: selectedTierFinal,
      tierDetails: selectedTierInfo, // ✅ store in DB
      awsAccounts,
      selectedStorageCount,
      bucketNote,
      awsCountText,
      accessList,
      step4Data,
      acknowledgements,
      existingAccountId,
      existingStorageName,
      changesRequested,
      details,
    });

    await newRequest.save();

    // 4️⃣ Build Jira ADF Description
    const awsAccountsContent =
      awsAccounts?.length > 0
        ? awsAccounts.map((acc) => ({
            type: "paragraph",
            content: [{ type: "text", text: `- Alias: ${acc.alias} | Org: ${acc.orgName}` }],
          }))
        : [{ type: "paragraph", content: [{ type: "text", text: "No AWS accounts provided" }] }];

    const accessListContent =
      accessList?.length > 0
        ? accessList.map((user) => ({
            type: "paragraph",
            content: [{ type: "text", text: `- ${user.fullName} (${user.email}) — Access: ${user.accessLevel}` }],
          }))
        : [{ type: "paragraph", content: [{ type: "text", text: "No access list provided" }] }];

    const step4Content = step4Data
      ? [
          { type: "paragraph", content: [{ type: "text", text: `File Sharing: ${step4Data.fileSharing || "N/A"}` }] },
          { type: "paragraph", content: [{ type: "text", text: `File Options: ${step4Data.fileOptions?.join(", ") || "None"}` }] },
          { type: "paragraph", content: [{ type: "text", text: `OTP Plan: ${JSON.stringify(step4Data.otpPlan) || "N/A"}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Custom OTP: ${JSON.stringify(step4Data.customOtp) || "N/A"}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Lifecycle: ${step4Data.lifecycle}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Retention: ${step4Data.retentionDays} days, ${step4Data.retentionMonths} months` }] },
          { type: "paragraph", content: [{ type: "text", text: `Transition: Glacier=${step4Data.transitionGlacier}, Standard=${step4Data.transitionStandard}` }] },
        ]
      : [{ type: "paragraph", content: [{ type: "text", text: "No step4 configuration provided" }] }];

    const ackContent =
      acknowledgements?.length > 0
        ? acknowledgements.map((ack) => ({
            type: "paragraph",
            content: [{ type: "text", text: `✅ ${ack}` }],
          }))
        : [{ type: "paragraph", content: [{ type: "text", text: "No acknowledgements" }] }];

    const changeContent = [
      { type: "paragraph", content: [{ type: "text", text: `Existing Account ID: ${existingAccountId || "N/A"}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Existing Storage Name: ${existingStorageName || "N/A"}` }] },
      ...(changesRequested?.length > 0
        ? changesRequested.map((ch) => ({
            type: "paragraph",
            content: [{ type: "text", text: `- ${ch}` }],
          }))
        : [{ type: "paragraph", content: [{ type: "text", text: "No changes requested" }] }]),
      { type: "paragraph", content: [{ type: "text", text: `Additional Details: ${details || "N/A"}` }] },
    ];

    const jiraDescriptionADF = {
      type: "doc",
      version: 1,
      content: [
        { type: "paragraph", content: [{ type: "text", text: `Reporter: ${reporterNameFinal}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Email: ${reporterEmailFinal}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Company: ${companyFinal}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Phone: ${phoneFinal}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Account ID: ${accountIdFinal}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Bucket: ${bucketNameFinal}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Priority: ${priorityFinal}` }] },

        { type: "paragraph", content: [{ type: "text", text: `Tier: ${selectedTierInfo.title}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Storage: ${selectedTierInfo.storage}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Channels: ${selectedTierInfo.channels}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Response Time: ${selectedTierInfo.response}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Availability: ${selectedTierInfo.availability}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Extras: ${selectedTierInfo.extras}` }] },

        { type: "expand", attrs: { title: "AWS Accounts" }, content: awsAccountsContent },
        { type: "expand", attrs: { title: "Access List" }, content: accessListContent },
        { type: "expand", attrs: { title: "Step4 Configuration" }, content: step4Content },
        { type: "expand", attrs: { title: "Acknowledgements" }, content: ackContent },
        { type: "expand", attrs: { title: "Changes Requested" }, content: changeContent },

        { type: "paragraph", content: [{ type: "text", text: `Created At: ${new Date().toISOString()}` }] },
      ],
    };

    // 5️⃣ Send to Jira
    const response = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: titleFinal,
          description: jiraDescriptionADF,
          issuetype: { name: "Task" },
          priority: { name: priorityFinal },
        },
      },
      {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      }
    );

    // 6️⃣ Save Jira IDs
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
