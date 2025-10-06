const Request = require("../models/Request");
const axios = require("axios");

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
      awsAccounts,
      selectedStorageCount,
      bucketNote,
      awsCountText,
      accessList,
      step4Data,
      acknowledgements,
      // ✅ Step6 Change section
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
    const selectedTierFinal = selectedTier || "standard";
    const titleFinal = title || `Request from ${reporterEmailFinal}`;
    const descriptionFinal = description || "No description provided";

    // 2️⃣ Safe arrays (avoid undefined errors)
    const awsAccountsSafe = Array.isArray(awsAccounts) ? awsAccounts : [];
    const accessListSafe = Array.isArray(accessList) ? accessList : [];
    const changesRequestedSafe = Array.isArray(changesRequested) ? changesRequested : [];

    // 3️⃣ Identify request type
    let requestType = "general";
    if (awsAccountsSafe.length > 0) requestType = "aws";
    else if (selectedStorageCount) requestType = "storage";
    else if (existingAccountId || existingStorageName) requestType = "change";

    // 4️⃣ Map tier details
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

    const selectedTierInfo =
      tierDetailsMap[selectedTierFinal.toLowerCase()] || tierDetailsMap.standard;

    // 5️⃣ Save to MongoDB
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
      awsAccounts: awsAccountsSafe,
      selectedStorageCount,
      bucketNote,
      awsCountText,
      accessList: accessListSafe,
      step4Data,
      acknowledgements,
      existingAccountId,
      existingStorageName,
      changesRequested: changesRequestedSafe,
      details,
      requestType, // ✅ added for dashboard filtering
    });

    await newRequest.save();

    // 6️⃣ Prepare Jira content
    const coreInfo = [
      { type: "paragraph", content: [{ type: "text", text: `Reporter: ${reporterNameFinal}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Email: ${reporterEmailFinal}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Company: ${companyFinal}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Phone: ${phoneFinal}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Account ID: ${accountIdFinal}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Bucket: ${bucketNameFinal}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Priority: ${priorityFinal}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Request Type: ${requestType.toUpperCase()}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Tier: ${selectedTierInfo.title}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Storage: ${selectedTierInfo.storage}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Response: ${selectedTierInfo.response}` }] },
    ];

    const awsAccountsContent = awsAccountsSafe.map((acc) => ({
      type: "paragraph",
      content: [{ type: "text", text: `- Alias: ${acc.alias} | Org: ${acc.orgName}` }],
    }));

    const accessListContent = accessListSafe.map((user) => ({
      type: "paragraph",
      content: [{ type: "text", text: `- ${user.fullName} (${user.email}) — ${user.accessLevel}` }],
    }));

    const changeContent = [
      { type: "paragraph", content: [{ type: "text", text: `Existing Account ID: ${existingAccountId || "N/A"}` }] },
      { type: "paragraph", content: [{ type: "text", text: `Existing Storage Name: ${existingStorageName || "N/A"}` }] },
      ...changesRequestedSafe.map((ch) => ({
        type: "paragraph",
        content: [{ type: "text", text: `- ${ch}` }],
      })),
      { type: "paragraph", content: [{ type: "text", text: `Details: ${details || "N/A"}` }] },
    ];

    const step4Content = step4Data
      ? [
          { type: "paragraph", content: [{ type: "text", text: `File Sharing: ${step4Data.fileSharing || "N/A"}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Lifecycle: ${step4Data.lifecycle || "N/A"}` }] },
        ]
      : [];

    const ackContent = acknowledgements?.map((ack) => ({
      type: "paragraph",
      content: [{ type: "text", text: `✅ ${ack}` }],
    })) || [];

    // 7️⃣ Combine blocks conditionally
    const contentBlocks = [];
    if (awsAccountsSafe.length > 0)
      contentBlocks.push({ type: "expand", attrs: { title: "AWS Accounts" }, content: awsAccountsContent });
    if (accessListSafe.length > 0)
      contentBlocks.push({ type: "expand", attrs: { title: "Access List" }, content: accessListContent });
    if (step4Data)
      contentBlocks.push({ type: "expand", attrs: { title: "Step 4 Configuration" }, content: step4Content });
    if (ackContent.length > 0)
      contentBlocks.push({ type: "expand", attrs: { title: "Acknowledgements" }, content: ackContent });
    if (existingAccountId || existingStorageName || changesRequestedSafe.length > 0)
      contentBlocks.push({ type: "expand", attrs: { title: "Changes Requested" }, content: changeContent });

    // 8️⃣ Build Jira description ADF
    const jiraDescriptionADF = {
      type: "doc",
      version: 1,
      content: [
        ...coreInfo,
        ...contentBlocks,
        { type: "paragraph", content: [{ type: "text", text: `Created At: ${new Date().toISOString()}` }] },
      ],
    };

    console.log("📤 Creating Jira Issue:", {
      summary: titleFinal,
      type: requestType,
      reporter: reporterEmailFinal,
    });

    // 9️⃣ Create Jira issue
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

    // 🔟 Save Jira link back
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
