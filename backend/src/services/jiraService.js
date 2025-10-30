// services/jiraService.js
const axios = require("axios");
require("dotenv").config();

const JIRA_BASE = process.env.JIRA_BASE_URL;      // e.g., https://your-domain.atlassian.net
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY; // e.g., CW 
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

// Base64 auth header
const jiraAuth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

// Map our priorities to Jira recognized priorities
const mapPriority = (priority) => {
  switch (priority) {
    case "Low":
      return { name: "Low" };
    case "Medium":
      return { name: "Medium" };
    case "High":
      return { name: "High" };
    default:
      return { name: "Medium" };
  }
};

// Create Jira Issue
exports.createIssue = async ({ summary, description, priority }) => {
  try {
    const payload = {
      fields: {
        project: { key: PROJECT_KEY },
        summary,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: description }],
            },
          ],
        },
        issuetype: { name: "Task" },
        // priority: mapPriority(priority),
      },
    };

    const res = await axios.post(`${JIRA_BASE}/rest/api/3/issue`, payload, {
      headers: {
        Authorization: `Basic ${jiraAuth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return res.data; // contains id, key, etc.
  } catch (err) {
    console.error("Jira API error:", err.response?.data || err.message);
    throw err;
  }
};

// Optional: Fetch Jira issue
exports.getIssue = async (issueKey, fields = "summary,status") => {
  const res = await axios.get(`${JIRA_BASE}/rest/api/3/issue/${issueKey}?fields=${fields}`, {
    headers: {
      Authorization: `Basic ${jiraAuth}`,
      Accept: "application/json",
    },
  });
  return res.data;
};

// Optional: Update Jira issue
exports.updateIssue = async (issueKey, { summary, description, priority }) => {
  const payload = {
    fields: {
      summary,
      description: {
        type: "doc",
        version: 1,
        content: [
          { type: "paragraph", content: [{ type: "text", text: description }] },
        ],
      },
      // priority: mapPriority(priority),
    },
  };
  await axios.put(`${JIRA_BASE}/rest/api/3/issue/${issueKey}`, payload, {
    headers: {
      Authorization: `Basic ${jiraAuth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
};

// Optional: Delete Jira issue
exports.deleteIssue = async (issueKey) => {
  await axios.delete(`${JIRA_BASE}/rest/api/3/issue/${issueKey}`, {
    headers: {
      Authorization: `Basic ${jiraAuth}`,
      Accept: "application/json",
    },
  });
};
