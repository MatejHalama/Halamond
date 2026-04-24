import * as UI_MODE from "../../constants/uiMode.js";
import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function createListing({ store, api, payload }) {
  const dataResult = await api.listings.createListing(payload);

  if (dataResult.status !== API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedListing: null,
        selectedTicket: null,
        errorMessage: null,
        notification: {
          type: NOTIFICATION_TYPE.ERR,
          message: dataResult.reason ?? "Chyba při vytváření inzerátu",
        },
      },
    }));
    return { status: "ERROR", reason: dataResult.reason };
  }

  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      mode: UI_MODE.LISTING_DETAIL,
      selectedListing: dataResult.listing,
      selectedTicket: null,
      errorMessage: null,
      notification: {
        type: NOTIFICATION_TYPE.OK,
        message: "Inzerát byl vytvořen",
      },
    },
  }));
  return { status: "SUCCESS" };
}
