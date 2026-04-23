import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function uploadPicture({ store, api, payload }) {
  const { listingId, file } = payload;
  const result = await api.listings.uploadPicture(listingId, file);

  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedListing: state.ui.selectedListing
          ? {
              ...state.ui.selectedListing,
              pictures: [
                ...(state.ui.selectedListing.pictures ?? []),
                result.picture,
              ],
            }
          : state.ui.selectedListing,
        selectedTicket: null,
        errorMessage: null,
        notification: {
          type: NOTIFICATION_TYPE.OK,
          message: "Obrázek úspěšně nahrán",
        },
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
