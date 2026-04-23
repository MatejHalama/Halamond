import * as API_STATUS from "../../statuses/apiStatus.js";

export async function dismissReport({ store, api, payload }) {
  const result = await api.reports.deleteReport(payload.reportId);
  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      reports: (state.reports ?? []).filter(
        (r) => r.ReportID !== payload.reportId,
      ),
    }));
  }
  return result;
}
