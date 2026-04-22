import * as API_STATUS from "../../statuses/apiStatus.js";

export async function blockListing({ store, api, payload }) {
  const result = await api.listings.blockListing(payload.listingId);
  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedListing: state.ui.selectedListing
          ? { ...state.ui.selectedListing, State: "blocked" }
          : state.ui.selectedListing,
      },
    }));
  }
  return result;
}
