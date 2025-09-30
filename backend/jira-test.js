// jira-test.js
const axios = require("axios");
require("dotenv").config();

const jiraAuth = Buffer.from(
  `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
).toString("base64");

const JIRA_BASE = process.env.JIRA_BASE_URL;
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

async function testCreateAndGetIssue() {
  try {
    // Step 1: Create issue
    const payload = {
      fields: {
        project: { key: PROJECT_KEY },
        summary: "Test Issue from Cloudsentrics Backend 🚀",
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "This is a test issue created via Jira API integration.",
                  type: "text",
                },
              ],
            },
          ],
        },
        issuetype: { name: "Task" },
      },
    };

    const createRes = await axios.post(`${JIRA_BASE}/rest/api/3/issue`, payload, {
      headers: {
        Authorization: `Basic ${jiraAuth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const issueKey = createRes.data.key;
    console.log("✅ Issue created successfully!");
    console.log("Issue Key:", issueKey);
    console.log("Issue URL:", `${JIRA_BASE}/browse/${issueKey}`);

    // Step 2: Fetch issue status
    const getRes = await axios.get(`${JIRA_BASE}/rest/api/3/issue/${issueKey}?fields=status`, {
      headers: {
        Authorization: `Basic ${jiraAuth}`,
        Accept: "application/json",
      },
    });

    console.log("📌 Issue Status:", getRes.data.fields.status.name);
  } catch (err) {
    console.error("❌ Error:");
    if (err.response) {
      console.error(err.response.status, err.response.statusText);
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testCreateAndGetIssue();
