const axios = require("axios");

// Helper to fetch all Jira issues with pagination
const fetchAllJiraIssues = async () => {
  const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
  const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString("base64");

  let startAt = 0;
  const maxResults = 100; // Jira recommends max 100 per request
  let total = 1; // placeholder to enter the loop
  const allIssues = [];

  try {
    while (startAt < total) {
      const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search`, {

        params: {
          jql: `project=${JIRA_PROJECT_KEY}`,
          startAt,
          maxResults,
          fields: "issuetype,status,created,updated", // explicitly request only needed fields
        },
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      });

      const { issues, total: jiraTotal } = response.data;
      total = jiraTotal;

      allIssues.push(...issues);
      startAt += maxResults;
    }

    return allIssues;
  } catch (error) {
    console.error("❌ Jira API fetch error:", error.response?.data || error.message);
    throw new Error("Failed to fetch Jira data from Jira API");
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    // Fetch all issues from Jira
    const jiraIssues = await fetchAllJiraIssues();

    // Map issues safely
    const issues = jiraIssues.map(issue => ({
      type: issue.fields?.issuetype?.name || "Unknown",
      status: issue.fields?.status?.name || "Unknown",
      created: issue.fields?.created || "N/A",
      updated: issue.fields?.updated || "N/A",
      jiraKey: issue.key || "N/A",
    }));

    // Prepare summary stats
    const dashboardData = {
      totalRequests: issues.length,
      todo: issues.filter(i => i.status.toLowerCase() === "to do").length,
      inProgress: issues.filter(i => i.status.toLowerCase() === "in progress").length,
      inReview: issues.filter(i => ["in review", "approved"].includes(i.status.toLowerCase())).length,
      done: issues.filter(i => ["done", "rejected"].includes(i.status.toLowerCase())).length,
      issues,
    };

    console.log(`✅ Jira Dashboard fetched: ${issues.length} issues`);
    res.json(dashboardData);

  } catch (error) {
    console.error("❌ Failed to prepare dashboard:", error.message);
    res.status(500).json({ message: "Failed to fetch Jira dashboard", details: error.message });
  }
};
