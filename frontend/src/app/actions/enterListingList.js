import * as UI_MODE from "../../constants/uiMode.js";
import * as API_STATUS from "../../statuses/apiStatus.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";

export async function enterListingList({ store, api }) {
  const state = store.getState();
  const isLoggedIn = !!state.auth.userId;

  const [dataResult, myResult] = await Promise.all([
    api.listings.getListings({}),
    isLoggedIn
      ? api.listings.getMyListings()
      : Promise.resolve({ status: "SUCCESS", listings: [] }),
  ]);

  if (dataResult.status !== API_STATUS.OK) {
    store.setState((s) => ({
      ...s,
      ui: { ...s.ui, status: UI_STATUS.ERR, errorMessage: "No data loaded" },
    }));
    return;
  }

  store.setState((s) => ({
    ...s,
    listings: dataResult.listings,
    myListings:
      myResult.status === API_STATUS.OK ? (myResult.listings ?? []) : [],
    ui: {
      ...s.ui,
      mode: UI_MODE.LISTING_LIST,
      selectedListing: null,
      filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
      status: UI_STATUS.RDY,
      errorMessage: null,
    },
  }));
}
