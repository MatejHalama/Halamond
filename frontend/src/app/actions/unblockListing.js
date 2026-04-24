import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function unblockListing({ store, api, payload }) {
  const result = await api.listings.unblockListing(payload.listingId);
  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      blockedListings: (state.blockedListings ?? []).filter(
        (l) => l.ListingID !== payload.listingId,
      ),
      ui: {
        ...state.ui,
        selectedListing: result.listing
          ? {
              ...result.listing,
              pictures: state.ui.selectedListing?.pictures ?? [],
            }
          : state.ui.selectedListing,
        notification: {
          type: NOTIFICATION_TYPE.OK,
          message: "Inzerát odblokován",
        },
      },
    }));
  } else {
    store.setState((state) => {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTicket: null,
          errorMessage: null,
          notification: {
            type: NOTIFICATION_TYPE.ERR,
            message: result.reason,
          },
        },
      };
    });
  }
  return result;
}
