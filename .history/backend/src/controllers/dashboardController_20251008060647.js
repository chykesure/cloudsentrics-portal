const axios = require("axios");

// Helper to fetch Jira issues for a specific reporter (company email)
const fetchAllJiraIssues = async (reporterEmail) => {
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
      // ✅ Use /rest/api/3/search/jql — new endpoint required by Jira
      const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search/jql`, {
  params: {
    jql: `project = ${JIRA_PROJECT_KEY} AND reporter = "${companyEmail}"`,
    fields: "issuetype,status,created,updated",
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

    console.log(`📦 Total issues fetched for ${reporterEmail}: ${allIssues.length}`);
    return allIssues;
  } catch (error) {
    console.error("❌ Jira API fetch error:", error.response?.data || error.message);
    throw new Error("Failed to fetch Jira data from Jira API");
  }
};

// Main dashboard controller
exports.getDashboardData = async (req, res) => {
  const { companyEmail } = req.query;
  console.log("📩 Incoming dashboard request for:", companyEmail);

  if (!companyEmail) {
    return res.status(400).json({ message: "Company email is required" });
  }

  const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
  const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
  const auth = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString("base64");

  try {
    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/search`,
      {
        jql: `project=${JIRA_PROJECT_KEY} AND reporter="${companyEmail}"`,
        fields: ["issuetype", "status", "created", "updated"],
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const issues = response.data.issues || [];
    console.log(`📦 Total issues fetched for ${companyEmail}:`, issues.length);

    const mappedIssues = issues.map((issue) => ({
      type: issue.fields.issuetype?.name || "Unknown",
      status: issue.fields.status?.name || "Unknown",
      created: issue.fields.created,
      updated: issue.fields.updated,
      jiraKey: issue.key,
    }));

    const statusCounts = mappedIssues.reduce(
      (acc, issue) => {
        const status = issue.status.toLowerCase();
        if (status.includes("to do")) acc.todo++;
        else if (status.includes("in progress")) acc.inProgress++;
        else if (status.includes("review")) acc.inReview++;
        else if (status.includes("done")) acc.done++;
        return acc;
      },
      { todo: 0, inProgress: 0, inReview: 0, done: 0 }
    );

    return res.json({
      totalRequests: mappedIssues.length,
      ...statusCounts,
      issues: mappedIssues,
    });
  } catch (error) {
    console.error("❌ Jira API fetch error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to fetch Jira data" });
  }
};