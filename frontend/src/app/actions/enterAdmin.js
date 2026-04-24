import * as UI_MODE from "../../constants/uiMode.js";
import * as API_STATUS from "../../statuses/apiStatus.js";

export async function enterAdmin({ store, api }) {
  const [reportsResult, categoriesResult] = await Promise.all([
    api.reports.getReports(),
    api.categories.getCategoriesFlat(),
  ]);

  store.setState((state) => ({
    ...state,
    reports:
      reportsResult.status === API_STATUS.OK
        ? (reportsResult.reports ?? [])
        : [],
    adminCategories:
      categoriesResult.status === API_STATUS.OK
        ? (categoriesResult.categories ?? [])
        : (state.adminCategories ?? []),
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
