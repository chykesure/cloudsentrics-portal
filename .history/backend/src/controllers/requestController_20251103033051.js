const Request = require("../models/Request");
const axios = require("axios");
const nodemailer = require("nodemailer");

// ===============================
// ✅ Nodemailer Setup
// ===============================
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

// ===============================
// ✅ Create Request Controller
// ===============================
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

    // 2️⃣ Tier mapping
    const tierMap = {
      standard: {
        title: "STANDARD TIER",
        storage: "300GB",
        channels: ["Dashboard", "Email"],
        response: "Within 24 hrs",
        availability: "24/7 support coverage",
        extras: "Access to knowledge base & FAQs",
      },
      business: {
        title: "BUSINESS TIER",
        storage: "600GB",
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

    if (tierDetails) {
      cleanData.tierTitle = tierDetails.title;
      cleanData.tierStorage = tierDetails.storage;
    }

    // 3️⃣ Save request to MongoDB
    const newRequest = new Request(cleanData);
    await newRequest.save();

    // 4️⃣ Helper: build Jira ADF sections
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

    // ✅ AWS Section
    const awsSection = buildADFSection(
      "AWS Accounts",
      (cleanData.awsAccounts || []).map(
        (a) => `Alias: ${a.alias} | Org: ${a.orgName}`
      )
    );

    // ✅ AWS Count Section
    const awsCountSection =
      cleanData.selectedAwsCount || cleanData.awsCountText
        ? buildADFSection("AWS Account Summary", [
          `Number of AWS Account(s) Needed: ${cleanData.selectedAwsCount || cleanData.awsCountText
          }`,
        ])
        : null;

    // ✅ Storage Count Section
    const storageCountSection =
      cleanData.selectedStorageCount
        ? buildADFSection("Account Summary", [
          `Number of Storage Account(s) Needed: ${cleanData.selectedStorageCount}`,
        ])
        : null;

    // ✅ Storage Alias Names (A–F)
    const storageNames = cleanData.storageNames || {};
    const storageSection =
      storageNames && Object.keys(storageNames).length > 0
        ? [
          {
            type: "paragraph",
            content: [{ type: "text", text: " " }],
          },
          {
            type: "expand",
            attrs: { title: "Storage Alias Names (A–F)" },
            content: Object.entries(storageNames)
              .filter(([_, val]) => val && val.trim() !== "")
              .map(([key, val]) => ({
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: `${key}: cloudsentrics-storage-${val}`,
                  },
                ],
              })),
          },
        ]
        : [];

    // ✅ Access List Section
    const accessSection = buildADFSection(
      "Access List",
      (cleanData.accessList || []).map(
        (u) => `${u.fullName} (${u.email}) — Access: ${u.accessLevel}`
      )
    );

    // ✅ Step4 Configuration
    const step4 = cleanData.step4Data
      ? Object.entries(cleanData.step4Data)
        .filter(([key, val]) => val && val !== "")
        .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
      : [];
    const step4Section = buildADFSection("Step4 Configuration", step4);

    // ✅ Acknowledgements
    const ackSection = buildADFSection(
      "Acknowledgements",
      (cleanData.acknowledgements || []).map((a) => `✅ ${a}`)
    );

    // ✅ Change Request Details
    const changeEntries = [];
    if (cleanData.existingAccountId)
      changeEntries.push(`Existing Account ID: ${cleanData.existingAccountId}`);
    if (cleanData.existingStorageName)
      changeEntries.push(
        `Existing Storage Name: ${cleanData.existingStorageName}`
      );
    if (cleanData.changesRequested?.length)
      changeEntries.push(
        ...cleanData.changesRequested.map((c) => `Change: ${c}`)
      );
    if (cleanData.details)
      changeEntries.push(`Additional Details: ${cleanData.details}`);
    const changeSection = buildADFSection(
      "Change Request Details",
      changeEntries
    );

    // 5️⃣ Build Jira Description
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
              content: [
                { type: "text", text: `Company: ${cleanData.company}` },
              ],
            },
          ]
          : []),
        ...(tierDetails
          ? [
            {
              type: "paragraph",
              content: [
                { type: "text", text: `Tier: ${tierDetails.title}` },
              ],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: `Storage: ${tierDetails.storage}` },
              ],
            },
          ]
          : []),

        // ✅ AWS and Storage Counts
        ...(awsCountSection ? [awsCountSection] : []),
        ...(storageCountSection ? [storageCountSection] : []),

        // ✅ Sections
        ...(awsSection ? [awsSection] : []),
        ...storageSection,
        ...(accessSection ? [accessSection] : []),
        ...(step4Section ? [step4Section] : []),
        ...(ackSection ? [ackSection] : []),
        ...(changeSection ? [changeSection] : []),
      ],
    };

    // 6️⃣ Sync to Jira
    const jiraResponse = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary:
            cleanData.title || `Request from ${cleanData.reporterEmail}`,
          description: descriptionADF,
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

    // 7️⃣ Save Jira key in MongoDB
    newRequest.jiraIssueId = jiraResponse.data.id;
    newRequest.jiraIssueKey = jiraResponse.data.key;
    await newRequest.save();

    // 8️⃣ Send Acknowledgement Email
    if (cleanData.reporterEmail) {
      const ticketId = newRequest.jiraIssueKey;
      const ackMailOptions = {
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: cleanData.reporterEmail,
        subject: `Your Request Has Been Received – [Ticket #${ticketId}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; color: #333;">
            <div style="background-color: #1a73e8; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin:0; font-size: 20px;">Cloud Sentrics Support</h1>
            </div>
            <div style="padding: 20px; line-height: 1.6;">
              <p>Dear Client,</p>
              <p>Thank you for contacting <strong>CloudSentrics Limited</strong>.</p>
              <p>We have received your request with the following details:</p>
              <table cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #e0e0e0;">
                <tr style="background-color: #f5f5f5;">
                  <td style="font-weight: 700; width: 150px;">Ticket ID:</td>
                  <td>${ticketId}</td>
                </tr>
              </table>
              <p>One of our engineers will be assigned shortly to review your case.</p>
              <p>You will receive another update once your ticket has been assigned.</p>
              <br/>
              <p>Kind regards,</p>
              <p><strong>Cloud Sentrics Support Team</strong><br/>
              <a href="mailto:customersupport@cloudsentrics.org" style="color:#1a73e8;">customersupport@cloudsentrics.org</a><br/>
              <a href="https://www.cloudsentrics.org" style="color:#1a73e8;">www.cloudsentrics.org</a></p>
            </div>
          </div>
        `,
      };

      sendEmail(ackMailOptions)
        .then((info) => console.log("Acknowledgement email sent:", info.response))
        .catch((err) =>
          console.error("Error sending acknowledgement email:", err)
        );
    }

    // ✅ Response
    res.status(201).json({
      message:
        "Request created, synced with Jira, and acknowledgment email sent",
      jiraIssueKey: newRequest.jiraIssueKey,
      request: newRequest,
    });
  } catch (error) {
    console.error(
      "❌ Error creating request:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to create request",
      error: error.response?.data || error.message,
    });
  }
};
