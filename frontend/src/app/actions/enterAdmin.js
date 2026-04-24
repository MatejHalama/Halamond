import * as UI_MODE from "../../constants/uiMode.js";
import * as API_STATUS from "../../statuses/apiStatus.js";

export async function enterAdmin({ store, api }) {
  const [
    reportsResult,
    categoriesResult,
    blockedListingsResult,
    blockedUsersResult,
  ] = await Promise.all([
    api.reports.getReports(),
    api.categories.getCategoriesFlat(),
    api.listings.getBlockedListings(),
    api.users.getBlockedUsers(),
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
    blockedListings:
      blockedListingsResult.status === API_STATUS.OK
        ? (blockedListingsResult.listings ?? [])
        : [],
    blockedUsers:
      blockedUsersResult.status === API_STATUS.OK
        ? (blockedUsersResult.users ?? [])
        : [],
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
