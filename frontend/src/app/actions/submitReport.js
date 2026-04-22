export async function submitReport({ api, payload }) {
  return api.reports.submitReport(payload);
}
