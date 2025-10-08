const axios = require("axios");

exports.getDashboard = async (req, res) => {
  try {
    const JIRA_PROJECT = "Cloudsentrics Test"; // your project name
    const JIRA_DOMAIN = "polycarpchike.atlassian.net";

    // Fetch all issues for the project from Jira
    const response = await axios.get(
      `https://${JIRA_DOMAIN}/rest/api/3/search?jql=project="${JIRA_PROJECT}"&maxResults=1000`,
      {
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
    console.error("Failed to fetch Jira data:", error.message);
    return res.status(500).json({ message: "Failed to fetch Jira data" });
  }
};
