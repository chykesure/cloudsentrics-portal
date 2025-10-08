// controllers/dashboardController.js
const axios = require("axios");
exports.getDashboard = async (req, res) => {
    try {
        const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;
        console.log("Using Jira:", JIRA_BASE_URL, JIRA_PROJECT_KEY);

        const response = await axios.get(
            `${JIRA_BASE_URL}/rest/api/3/search?jql=project=${JIRA_PROJECT_KEY}&maxResults=5`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")}`,
                    Accept: "application/json",
                },
            }
        );

        console.log("Jira raw data:", JSON.stringify(response.data, null, 2));

        const issues = response.data.issues.map(issue => ({
            type: issue.fields.issuetype?.name || "Unknown",
            status: issue.fields.status?.name || "Unknown",
            created: issue.fields.created,
            updated: issue.fields.updated,
            jiraKey: issue.key,
        }));

        console.log(`Mapped ${issues.length} issues`);

        res.json({
            totalRequests: issues.length,
            todo: issues.filter(i => i.status.toLowerCase() === "to do").length,
            inProgress: issues.filter(i => i.status.toLowerCase() === "in progress").length,
            inReview: issues.filter(i => ["in review", "approved"].includes(i.status.toLowerCase())).length,
            done: issues.filter(i => ["done", "rejected"].includes(i.status.toLowerCase())).length,
            issues,
        });
    } catch (err) {
        console.error("Jira fetch error:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to fetch Jira data" });
    }
};
