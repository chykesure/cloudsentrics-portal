const axios = require("axios");
const Report = require("../models/Report");

exports.getDashboard = async (req, res) => {
  try {
    const email = req.params.email;

    // Fetch user's reports from MongoDB
    const reports = await Report.find({ email });
    if (!reports.length) {
      return res.status(200).json({
        totalRequests: 0,
        todo: 0,
        inProgress: 0,
        inReview: 0,
        done: 0,
        issues: [],
      });
    }

    const dashboardData = {
      totalRequests: reports.length,
      todo: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      issues: [],
    };

    for (const report of reports) {
      let jiraIssue = null;

      if (report.jiraIssueId) {
        try {
          const jiraResponse = await axios.get(
            `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${report.jiraIssueId}`,
            {
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
                ).toString("base64")}`,
                Accept: "application/json",
              },
            }
          );
          jiraIssue = jiraResponse.data;
        } catch (err) {
          console.warn(`❌ Jira fetch failed for ${report.jiraIssueId}`);
        }
      }

      // Determine status
      const jiraStatus = jiraIssue?.fields?.status?.name || "Pending";
      switch (jiraStatus.toLowerCase()) {
        case "pending":
          dashboardData.todo++;
          break;
        case "in progress":
          dashboardData.inProgress++;
          break;
        case "in review":
        case "approved":
          dashboardData.inReview++;
          break;
        case "done":
        case "rejected":
          dashboardData.done++;
          break;
        default:
          dashboardData.todo++;
      }

      // Add issue to array for table
      dashboardData.issues.push({
        type: jiraIssue?.fields?.issuetype?.name || "Unknown",
        status: jiraStatus,
        created: jiraIssue?.fields?.created || report.createdAt || new Date(),
        updated: jiraIssue?.fields?.updated || report.updatedAt || new Date(),
        jiraKey: jiraIssue?.key || report.jiraIssueId || "-",
      });
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
};
