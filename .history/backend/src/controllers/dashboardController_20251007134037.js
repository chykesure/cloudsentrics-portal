const axios = require("axios");

exports.getDashboard = async (req, res) => {
  try {
    const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
    const JIRA_BASE_URL = process.env.JIRA_BASE_URL;

    console.log("🔹 Jira Project Key:", JIRA_PROJECT_KEY);
    console.log("🔹 Jira Base URL:", JIRA_BASE_URL);

    const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search`, {
      params: { jql: `project=${JIRA_PROJECT_KEY}`, maxResults: 1000 },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
        ).toString("base64")}`,
        Accept: "application/json",
      },
    });

    console.log("✅ Jira API Status:", response.status);
    console.log("🔹 Total issues returned:", response.data.issues.length);

    const issues = response.data.issues.map(issue => ({
      type: issue.fields.issuetype?.name || "Unknown",
      status: issue.fields.status?.name || "Unknown",
      created: issue.fields.created,
      updated: issue.fields.updated,
      jiraKey: issue.key,
    }));

    const dashboardData = {
      totalRequests: issues.length,
      todo: issues.filter(i => i.status.toLowerCase() === "to do").length,
      inProgress: issues.filter(i => i.status.toLowerCase() === "in progress").length,
      inReview: issues.filter(i => ["in review", "approved"].includes(i.status.toLowerCase())).length,
      done: issues.filter(i => ["done", "rejected"].includes(i.status.toLowerCase())).length,
      issues,
    };

    console.log("🔹 Dashboard data prepared:", dashboardData);

    res.json(dashboardData);
  } catch (error) {
    console.error("❌ Failed to fetch Jira data:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch Jira data" });
  }
};
