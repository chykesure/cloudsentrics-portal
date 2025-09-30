exports.createReport = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      accountId,
      bucketName,
      title,
      description,
      priority,
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
    } = req.body;

    if (!fullName || !email || !accountId || !confirm) {
      return res.status(400).json({ error: "Missing required fields or confirmation" });
    }

    const report = new Report({
      fullName,
      email,
      phone,
      company,
      accountId,
      bucketName,
      title,
      description,
      priority,
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
      image: req.file ? { filename: req.file.filename } : null, // store file info
    });

    await report.save();

    // Build Jira description
    const jiraDescription = `
*Reporter:* ${fullName} (${email})
*Phone:* ${phone || "N/A"}
*Company:* ${company || "N/A"}
*Account ID:* ${accountId}
*Bucket Name:* ${bucketName || "N/A"}
*Title:* ${title || "N/A"}
*Description:* ${description || "N/A"}
*Priority:* ${priority || "Medium"}
*Date/Time:* ${date || "N/A"} / ${time || "N/A"}
*Category:* ${category || "N/A"}
*Other Category:* ${otherCategoryDesc || "N/A"}
*Steps Taken:* ${steps || "N/A"}
*Confirmed:* ${confirm ? "Yes" : "No"}
${req.file ? `*Attached Image:* ${req.file.filename}` : ""}
`;

    const jiraResp = await createIssue({
      summary: title || `Report by ${fullName}`,
      description: jiraDescription,
      priority,
    });

    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    res.status(201).json({ success: true, report, jira: { key: jiraResp.key, id: jiraResp.id, url: report.jiraUrl } });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Failed to create report" });
  }
};
