//controllers/requestController.js
const Request = require("../models/Request");
const axios = require("axios");

/**
 * @desc Create a new Request and sync to Jira (only filled fields)
 */
exports.createRequest = async (req, res) => {
  try {
    const data = req.body;

    // 1️⃣ Filter out empty or undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    // 2️⃣ Tier mapping only if selected
    const tierMap = {
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

    const selectedTier = cleanData.selectedTier?.toLowerCase();
    const tierDetails = selectedTier ? tierMap[selectedTier] : null;

    // Store tier details in MongoDB too
    if (tierDetails) {
      cleanData.tierTitle = tierDetails.title;
      cleanData.tierStorage = tierDetails.storage;
    }

    // 3️⃣ Save to Mongo (only filled data)
    const newRequest = new Request(cleanData);
    await newRequest.save();

    // 4️⃣ Helper: ADF section builder
    const buildADFSection = (title, entries) => {
      if (!entries || entries.length === 0) return null;
      return {
        type: "expand",
        attrs: { title },
        content: entries.map((line) => ({
          type: "paragraph",
          content: [{ type: "text", text: line }],
        })),
      };
    };

    // AWS Accounts
    const awsSection = buildADFSection(
      "AWS Accounts",
      (cleanData.awsAccounts || []).map(
        (a) => `Alias: ${a.alias} | Org: ${a.orgName}`
      )
    );

    // AWS Count
    const awsCountSection =
      cleanData.selectedStorageCount || cleanData.awsCountText
        ? buildADFSection("AWS Account Summary", [
          `Number of AWS Account(s) Needed: ${cleanData.selectedStorageCount || cleanData.awsCountText}`,
        ])
        : null;

    // Access List
    const accessSection = buildADFSection(
      "Access List",
      (cleanData.accessList || []).map(
        (u) => `${u.fullName} (${u.email}) — Access: ${u.accessLevel}`
      )
    );

    // Step4 Data
    const step4 = cleanData.step4Data
      ? Object.entries(cleanData.step4Data)
        .filter(([key, val]) => val && val !== "")
        .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
      : [];
    const step4Section = buildADFSection("Step4 Configuration", step4);

    // Acknowledgements
    const ackSection = buildADFSection(
      "Acknowledgements",
      (cleanData.acknowledgements || []).map((a) => `✅ ${a}`)
    );

    // Change Requests
    const changeEntries = [];
    if (cleanData.existingAccountId)
      changeEntries.push(`Existing Account ID: ${cleanData.existingAccountId}`);
    if (cleanData.existingStorageName)
      changeEntries.push(`Existing Storage Name: ${cleanData.existingStorageName}`);
    if (cleanData.changesRequested?.length)
      changeEntries.push(...cleanData.changesRequested.map((c) => `Change: ${c}`));
    if (cleanData.details)
      changeEntries.push(`Additional Details: ${cleanData.details}`);
    const changeSection = buildADFSection("Change Request Details", changeEntries);

    // 🧩 Final Jira Description
    const descriptionADF = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Reporter Email: ${cleanData.reporterEmail}` },
          ],
        },
        ...(cleanData.company
          ? [
            {
              type: "paragraph",
              content: [{ type: "text", text: `Company: ${cleanData.company}` }],
            },
          ]
          : []),
        ...(tierDetails
          ? [
            {
              type: "paragraph",
              content: [{ type: "text", text: `Tier: ${tierDetails.title}` }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: `Storage: ${tierDetails.storage}` }],
            },
          ]
          : []),
        ...(awsCountSection ? [awsCountSection] : []),
        ...(awsSection ? [awsSection] : []),
        ...(accessSection ? [accessSection] : []),
        ...(step4Section ? [step4Section] : []),
        ...(ackSection ? [ackSection] : []),
        ...(changeSection ? [changeSection] : []),
      ],
    };

    // 5️⃣ Sync to Jira
    const jiraResponse = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: cleanData.title || `Request from ${cleanData.reporterEmail}`,
          description: descriptionADF,
          issuetype: { name: "Task" },
          priority: { name: cleanData.priority || "Medium" },
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

    // 6️⃣ Save Jira info in MongoDB
    newRequest.jiraIssueId = jiraResponse.data.id;
    newRequest.jiraIssueKey = jiraResponse.data.key;
    await newRequest.save();

    res.status(201).json({
      message: "Request created and synced with Jira successfully",
      jiraIssueKey: jiraResponse.data.key,
      request: newRequest,
    });
  } catch (error) {
    console.error("❌ Error creating request:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create request",
      error: error.response?.data || error.message,
    });
  }
};
