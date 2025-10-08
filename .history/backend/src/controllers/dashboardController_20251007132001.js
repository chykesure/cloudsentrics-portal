// controllers/dashboardController.js
const axios = require("axios");

exports.getDashboard = async (req, res) => {
  try {
    const JIRA_BASE_URL = process.env.JIRA_BASE_URL; // https://polycarpchike.atlassian.net
    const JIRA_EMAIL = process.env.JIRA_EMAIL;
    const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
    const JIRA_PROJECT = process.env.JIRA_PROJECT_KEY; // SCRUM

    if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT) {
      console.error("Missing Jira environment variables!");
      return res.status(500).json({ message: "Jira environment not configured" });
    }

    // Fetch issues from Jira
    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/search?jql=project=${JIRA_PROJECT}&maxResults=1000`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );

    const issues = response.data.issues.map((issue) => ({
      type: issue.fields.issuetype?.name || "Unknown",
      status: issue.fields.status?.name || "Unknown",
      created: issue.fields.created,
      updated: issue.fields.updated,
      jiraKey: issue.key,
    }));

    console.log(`Fetched ${issues.length} Jira issues for project ${JIRA_PROJECT}`);

    // Count statuses
    const dashboardData = {
      totalRequests: issues.length,
      todo: issues.filter((i) => i.status.toLowerCase() === "to do").length,
      inProgress: issues.filter((i) => i.status.toLowerCase() === "in progress").length,
      inReview: issues.filter((i) => ["in review", "approved"].includes(i.status.toLowerCase())).length,
      done: issues.filter((i) => ["done", "rejected"].includes(i.status.toLowerCase())).length,
      issues,
    };

    return res.json(dashboardData);
  } catch (error) {
    console.error("Failed to fetch Jira data:", error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to fetch Jira data" });
  }
};
