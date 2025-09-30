const axios = require("axios");
require("dotenv").config();

const jiraAuth = Buffer.from(
  `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
).toString("base64");

const JIRA_BASE = process.env.JIRA_BASE_URL;
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

exports.createIssue = async ({ summary, description }) => {
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
    },
  };

  const res = await axios.post(`${JIRA_BASE}/rest/api/3/issue`, payload, {
    headers: {
      Authorization: `Basic ${jiraAuth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return res.data;
};
