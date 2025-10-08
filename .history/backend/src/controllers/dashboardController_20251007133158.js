// controllers/dashboardController.js
const axios = require("axios");

exports.getDashboard = async (req, res) => {
  try {
    const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY; // e.g., "SCRUM"
    const JIRA_BASE_URL = process.env.JIRA_BASE_URL;       // e.g., "https://polycarpchike.atlassian.net"

    if (!JIRA_PROJECT_KEY || !JIRA_BASE_URL) {
      return res.status(500).json({ message: "Jira project key or base URL not set" });
    }

    // Fetch Jira issues
    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/search`,
      {
        params: {
          jql: `project=${JIRA_PROJECT_KEY}`,
          maxResults: 1000
        },
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
          ).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );

    const issues = response.data.issues.map(issue => ({
      type: issue.fields.issuetype?.name || "Unknown",
      status: issue.fields.status?.name || "Unknown",
      created: issue.fields.created,
      updated: issue.fields.updated,
      jiraKey: issue.key,
    }));

    // Count statuses for stats
    const dashboardData = {
      totalRequests: issues.length,
      todo: issues.filter(i => i.status.toLowerCase() === "to do").length,
      inProgress: issues.filter(i => i.status.toLowerCase() === "in progress").length,
      inReview: issues.filter(i =>
        ["in review", "approved"].includes(i.status.toLowerCase())
      ).length,
      done: issues.filter(i =>
        ["done", "rejected"].includes(i.status.toLowerCase())
      ).length,
      issues,
    };

    return res.json(dashboardData);
  } catch (error) {
    console.error("Failed to fetch Jira data:", error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to fetch Jira data" });
  }
};
