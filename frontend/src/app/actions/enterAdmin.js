import * as UI_MODE from "../../constants/uiMode.js";
import * as API_STATUS from "../../statuses/apiStatus.js";

export async function enterAdmin({ store, api }) {
  const result = await api.reports.getReports();

  store.setState((state) => ({
    ...state,
    reports: result.status === API_STATUS.OK ? (result.reports ?? []) : [],
    ui: {
      ...state.ui,
      mode: UI_MODE.ADMIN,
      selectedListing: null,
      selectedTicket: null,
      errorMessage: null,
      notification: null,
    },
  }));
}
