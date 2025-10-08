// controllers/dashboardController.js
const axios = require("axios");

exports.getDashboard = async (req, res) => {
  try {
    const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY; // e.g., "SCRUM"
    const JIRA_BASE_URL = process.env.JIRA_BASE_URL;       // e.g., "https://polycarpchike.atlassian.net"

    if (!JIRA_PROJECT_KEY || !JIRA_BASE_URL) {
      console.error("❌ Jira project key or base URL not set in .env");
      return res.status(500).json({ message: "Jira project key or base URL not set" });
    }

    console.log("🔹 Fetching Jira issues for project:", JIRA_PROJECT_KEY);

    const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search`, {
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
    });

    console.log("✅ Jira API response status:", response.status);
    console.log("🔹 Total issues returned by Jira:", response.data.issues.length);

    const issues = response.data.issues.map(issue => {
      console.log("📌 Parsing issue:", issue.key);
      return {
        type: issue.fields.issuetype?.name || "Unknown",
        status: issue.fields.status?.name || "Unknown",
        created: issue.fields.created,
        updated: issue.fields.updated,
        jiraKey: issue.key,
      };
    });

    // Count statuses
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

    console.log("🔹 Dashboard data prepared:", dashboardData);

    return res.json(dashboardData);

  } catch (error) {
    console.error("❌ Failed to fetch Jira data");
    if (error.response) {
      console.error("HTTP status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
    return res.status(500).json({ message: "Failed to fetch Jira data" });
  }
};
