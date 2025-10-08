const axios = require("axios");

// ==========================
// ✅ FETCH JIRA ISSUES BY REPORTER
// ==========================
const fetchAllJiraIssues = async (reporterEmail) => {
  const { JIRA_PROJECT_KEY, JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;

  try {
    const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search`, {
      params: {
        jql: `project = ${JIRA_PROJECT_KEY} AND reporter = "${reporterEmail}"`,
        fields: "issuetype,status,created,updated",
        maxResults: 1000, // optional: fetch up to 1000 issues
      },
      auth: {
        username: JIRA_EMAIL,
        password: JIRA_API_TOKEN,
      },
      headers: {
        Accept: "application/json",
      },
    });

    const issues = response.data.issues || [];
    console.log(`📦 Total issues fetched for ${reporterEmail}: ${issues.length}`);
    return issues;
  } catch (error) {
    console.error("❌ Jira API fetch error:", error.response?.data || error.message);
    throw new Error("Failed to fetch Jira data from Jira API");
  }
};

// ==========================
// ✅ MAIN DASHBOARD CONTROLLER
// ==========================
exports.getDashboardData = async (req, res) => {
  const { companyEmail } = req.query;
  console.log("📩 Incoming dashboard request for:", companyEmail);

  if (!companyEmail) {
    return res.status(400).json({ message: "Company email is required" });
  }

  try {
    const issues = await fetchAllJiraIssues(companyEmail);

    // Map Jira issues to a simplified format for the frontend
    const mappedIssues = issues.map((issue) => ({
      jiraKey: issue.key,
      type: issue.fields.issuetype?.name || "Unknown",
      status: issue.fields.status?.name || "Unknown",
      created: issue.fields.created,
      updated: issue.fields.updated,
    }));

    // Count issues by status
    const statusCounts = mappedIssues.reduce(
      (acc, issue) => {
        const status = (issue.status || "").toLowerCase();
        if (status.includes("to do")) acc.todo++;
        else if (status.includes("in progress")) acc.inProgress++;
        else if (status.includes("review")) acc.inReview++;
        else if (status.includes("done")) acc.done++;
        else acc.other++; // catch-all for custom statuses
        return acc;
      },
      { todo: 0, inProgress: 0, inReview: 0, done: 0, other: 0 }
    );

    console.log(`✅ Dashboard ready for ${companyEmail}`);

    return res.json({
      totalRequests: mappedIssues.length,
      ...statusCounts,
      issues: mappedIssues,
    });
  } catch (error) {
    console.error("❌ Failed to prepare dashboard:", error.message);
    return res.status(500).json({ message: "Failed to fetch Jira data" });
  }
};
