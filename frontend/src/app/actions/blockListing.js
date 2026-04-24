import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function blockListing({ store, api, payload }) {
  const result = await api.listings.blockListing(payload.listingId);
  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedListing: result.listing
          ? result.listing
          : null,
        selectedTicket: null,
        errorMessage: null,
        notification: {
          type: NOTIFICATION_TYPE.OK,
          message: "Stav změněn na ZABLOKOVANÝ",
        }
      },
    }));
  }
  else {
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
