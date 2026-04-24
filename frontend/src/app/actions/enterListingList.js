import * as UI_MODE from "../../constants/uiMode.js";
import * as API_STATUS from "../../statuses/apiStatus.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";

export async function enterListingList({ store, api }) {
  store.setState(
    (state) => (
      {
        ...state,
        ui: {
          ...state.ui,
          status: UI_STATUS.LOAD,
          notification: null,
          },
        }
    )
  );

  const state = store.getState();
  const isLoggedIn = !!state.auth.userId;

  const [dataResult, myResult, notifResult] = await Promise.all([
    api.listings.getListings({}),
    isLoggedIn
      ? api.listings.getMyListings()
      : Promise.resolve({ status: "SUCCESS", listings: [] }),
    isLoggedIn
      ? api.notifications.getNotifications()
      : Promise.resolve({ status: "SUCCESS", notifications: [] }),
  ]);

  if (dataResult.status !== API_STATUS.OK) {
    store.setState((s) => ({
      ...s,
      ui: {
        ...s.ui,
        selectedListing: null,
        selectedTicket: null,
        notification: null,
        status: UI_STATUS.ERR,
        errorMessage: "No data loaded"
      },
    }));
    return;
  }

  store.setState((s) => ({
    ...s,
    listings: dataResult.listings,
    myListings:
      myResult.status === API_STATUS.OK ? (myResult.listings ?? []) : [],
    notifications:
      notifResult.status === API_STATUS.OK ? (notifResult.notifications ?? []) : [],
    ui: {
      ...s.ui,
      mode: UI_MODE.LISTING_LIST,
      filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [] },
      status: UI_STATUS.RDY,
      selectedListing: null,
      selectedTicket: null,
      errorMessage: null,
      notification: null,
    },
  }));
}
