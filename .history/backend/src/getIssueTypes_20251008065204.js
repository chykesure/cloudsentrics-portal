require("dotenv").config();
const axios = require("axios");

(async () => {
  try {
    const response = await axios.get(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issuetype`,
      {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
      }
    );

    console.log("Available Jira issue types:");
    response.data.forEach((type) => console.log(type.name));
  } catch (err) {
    console.error("Error fetching issue types:", err.response?.data || err.message);
  }
})();
