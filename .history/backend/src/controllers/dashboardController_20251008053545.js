const axios = require("axios");

// Helper to fetch all Jira issues with pagination
const fetchAllJiraIssues = async () => {
  const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
  const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
  const auth = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString("base64");

  let startAt = 0;
  const maxResults = 100;
  let total = 1;
  const allIssues = [];

  try {
    while (startAt < total) {
      // ✅ FIXED: Use /rest/api/3/search (not /search/jql)
      const response = await axios.post(
        `${JIRA_BASE_URL}/rest/api/3/search`,
        {
          jql: `project = ${JIRA_PROJECT_KEY}`,
          startAt,
          maxResults,
          fields: ["issuetype", "status", "created", "updated", "reporter"],
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const { issues, total: jiraTotal } = response.data;
      total = jiraTotal;

      allIssues.push(...issues);
      startAt += maxResults;
    }

    console.log(`📦 Total issues fetched from Jira: ${allIssues.length}`);
    return allIssues;
  } catch (error) {
    console.error(
      "❌ Jira API fetch error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch Jira data from Jira API");
  }
};

// Main dashboard controller
exports.getDashboard = async (req, res) => {
  try {
    const userEmail = req.query.companyEmail;
    if (!userEmail) {
      return res.status(400).json({ message: "Missing companyEmail" });
    }

    console.log(`📩 Incoming dashboard request for: ${userEmail}`);

    const jiraIssues = await fetchAllJiraIssues();

    // Filter by reporter email
    const filteredIssues = jiraIssues.filter(
      (issue) =>
        issue.fields?.reporter?.emailAddress?.toLowerCase() ===
        userEmail.toLowerCase()
    );

    console.log(`🎯 Issues found for ${userEmail}: ${filteredIssues.length}`);

    const issues = filteredIssues.map((issue) => ({
      type: issue.fields?.issuetype?.name || "Unknown",
      status: issue.fields?.status?.name || "Unknown",
      created: issue.fields?.created || "N/A",
      updated: issue.fields?.updated || "N/A",
      jiraKey: issue.key || "N/A",
    }));

    const dashboardData = {
      totalRequests: issues.length,
      todo: issues.filter((i) => i.status.toLowerCase() === "to do").length,
      inProgress: issues.filter(
        (i) => i.status.toLowerCase() === "in progress"
      ).length,
      inReview: issues.filter((i) =>
        ["in review", "approved"].includes(i.status.toLowerCase())
      ).length,
      done: issues.filter((i) =>
        ["done", "rejected"].includes(i.status.toLowerCase())
      ).length,
      issues,
    };

    console.log(`✅ Jira Dashboard fetched for ${userEmail}`);
    res.json(dashboardData);
  } catch (error) {
    console.error("❌ Failed to prepare dashboard:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch Jira dashboard", details: error.message });
  }
};
