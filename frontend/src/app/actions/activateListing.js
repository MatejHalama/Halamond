import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function activateListing({ store, api, payload }) {
  const dataResult = await api.listings.activateListing(payload.listingId);

  if (dataResult.status !== API_STATUS.OK) {
    store.setState((state) => {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTicket: null,
          errorMessage: null,
          notification: {
            type: NOTIFICATION_TYPE.ERR,
            message: dataResult.reason,
          },
        },
      };
    });
    return;
  }

  store.setState((state) => {
    return {
      ...state,
      ui: {
        ...state.ui,
        selectedListing: {
          ...dataResult.listing,
          pictures: state.ui.selectedListing?.pictures ?? [],
        },
        selectedTicket: null,
        errorMessage: null,
        notification: {
          type: NOTIFICATION_TYPE.OK,
          message: "Stav změněn na AKTIVNÍ",
        },
      },
    };
  });
}
