const axios = require('axios');

const jiraAuth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
const JIRA_BASE = process.env.JIRA_BASE_URL;
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

async function createIssue({ summary, description, priority }, user) {
  const payload = {
    fields: {
      project: { key: PROJECT_KEY },
      summary,
      description,
      issuetype: { name: 'Task' },
      // optionally set priority or assignee here
    },
  };

  const res = await axios.post(`${JIRA_BASE}/rest/api/3/issue`, payload, {
    headers: {
      Authorization: `Basic ${jiraAuth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return res.data;
}

async function updateIssue(issueIdOrKey, payload) {
  const res = await axios.put(`${JIRA_BASE}/rest/api/3/issue/${issueIdOrKey}`, payload, {
    headers: {
      Authorization: `Basic ${jiraAuth}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

async function getIssue(issueIdOrKey, fields = 'status') {
  const res = await axios.get(`${JIRA_BASE}/rest/api/3/issue/${issueIdOrKey}?fields=${fields}`, {
    headers: { Authorization: `Basic ${jiraAuth}`, Accept: 'application/json' },
  });
  return res.data;
}

module.exports = { createIssue, updateIssue, getIssue };
