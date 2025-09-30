import API_BASE_URL from "../config/api";

export async function createReport(reportData) {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });

  return res.json();
}

export async function getReports() {
  const res = await fetch(`${API_BASE_URL}/reports`);
  return res.json();
}

export async function getReportById(id) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`);
  return res.json();
}

export async function updateReport(id, reportData) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });
  return res.json();
}

export async function deleteReport(id) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
