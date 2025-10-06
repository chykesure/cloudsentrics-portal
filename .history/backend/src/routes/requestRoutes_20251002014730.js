const Request = require("../models/Request");
const jiraService = require("../services/jiraService");

// @desc Create new request (Step1–Step6 submission)
exports.createRequest = async (req, res) => {
  try {
    const { awsAliases, selectedStorageCount, bucketNote, changeRequest, acknowledgements } = req.body;

    // Save request in DB
    const request = new Request({
      user: req.user._id,
      awsAliases,
      selectedStorageCount,
      bucketNote,
      changeRequest,
      acknowledgements,
    });
    await request.save();

    // Create Jira issue
    const jiraIssue = await jiraService.createIssue({
      summary: `New Storage Request - ${req.user.email}`,
      description: `
        AWS Aliases: ${awsAliases?.join(", ")}
        Storage Count: ${selectedStorageCount}
        Notes: ${bucketNote || "None"}
        Change Request: ${JSON.stringify(changeRequest) || "None"}
        Acknowledgements: ${acknowledgements?.join("\n")}
      `,
    });

    // Save Jira link in DB
    request.jiraIssueId = jiraIssue.key;
    await request.save();

    res.status(201).json(request);
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Failed to create request" });
  }
};

// @desc Get all requests for a logged-in user
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
