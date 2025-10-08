const axios = require("axios");
const Report = require("../models/Report");
const Onboarding = require("../models/Onboarding");

exports.getDashboard = async (req, res) => {
  try {
    const email = req.params.email;

    // ✅ Fetch user's reports from MongoDB
    const reports = await Report.find({ email });
    if (!reports.length) {
      return res.status(200).json({ message: "No reports found", data: {} });
    }

    let statusCounts = {
      Pending: 0,
      "In Progress": 0,
      Done: 0,
      Approved: 0,
      Rejected: 0,
    };

    // ✅ For each report, fetch latest status from Jira
    for (const report of reports) {
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

          const jiraStatus = jiraResponse.data.fields.status.name;
          statusCounts[jiraStatus] = (statusCounts[jiraStatus] || 0) + 1;
        } catch (err) {
          console.warn(`❌ Jira fetch failed for ${report.jiraIssueId}`);
        }
      }
    }

    // ✅ Send structured data to frontend
    res.status(200).json({
      total: reports.length,
      statuses: statusCounts,
    });
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
};
