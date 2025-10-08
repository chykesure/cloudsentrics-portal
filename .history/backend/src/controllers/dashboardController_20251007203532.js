const axios = require("axios");

exports.getDashboard = async (req, res) => {
    try {
        const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
        const JIRA_BASE_URL = process.env.JIRA_BASE_URL;

        const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search/jql`, {
            params: {
                jql: `project=${JIRA_PROJECT_KEY}`,
                maxResults: 1000,
                fields: "issuetype,status,created,updated" // explicitly request these fields
            },
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
                ).toString("base64")}`,
                Accept: "application/json",
            },
        });

        const issues = response.data.issues.map(issue => ({
            type: issue.fields?.issuetype?.name || "Unknown",
            status: issue.fields?.status?.name || "Unknown",
            created: issue.fields?.created || "N/A",
            updated: issue.fields?.updated || "N/A",
            jiraKey: issue.key || "N/A",
        }));

        const dashboardData = {
            totalRequests: issues.length,
            todo: issues.filter(i => i.status.toLowerCase() === "to do").length,
            inProgress: issues.filter(i => i.status.toLowerCase() === "in progress").length,
            inReview: issues.filter(i => ["in review", "approved"].includes(i.status.toLowerCase())).length,
            done: issues.filter(i => ["done", "rejected"].includes(i.status.toLowerCase())).length,
            issues,
        };

        res.json(dashboardData);
    } catch (error) {
        console.error("❌ Failed to fetch Jira data:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch Jira data", details: error.response?.data });
    }
};
