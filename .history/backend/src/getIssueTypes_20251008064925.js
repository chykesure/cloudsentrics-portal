const axios = require("axios");

async function getIssueTypes() {
  try {
    const response = await axios.get(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issuetype`,
      {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
        headers: { Accept: "application/json" },
      }
    );

    console.log("Available Issue Types:");
    response.data.forEach((type) => {
      console.log(`- ${type.name} (id: ${type.id})`);
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

getIssueTypes();
