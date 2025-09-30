// src/services/reportService.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type ReportPayload = {
  title: string;
  description: string;
  priority?: "Low" | "Medium" | "High";
};

export type Report = {
  _id: string;
  title: string;
  description: string;
  priority?: "Low" | "Medium" | "High";
  jiraIssueId?: string;
  jiraStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

async function request(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  return data;
}

export const createReport = async (payload: ReportPayload) => {
  return request(`/reports`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getReports = async (): Promise<{ success: boolean; reports?: Report[]; [k: string]: any }> => {
  return request(`/reports`);
};

export const getReportById = async (id: string) => {
  return request(`/reports/${id}`);
};

export const updateReport = async (id: string, payload: Partial<ReportPayload>) => {
  return request(`/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteReport = async (id: string) => {
  return request(`/reports/${id}`, { method: "DELETE" });
};
