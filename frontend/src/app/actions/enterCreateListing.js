import * as UI_MODE from "../../constants/uiMode.js";

export function enterCreateListing({ store }) {
  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      mode: UI_MODE.CREATE_LISTING,
      selectedListing: null,
      selectedTicket: null,
      errorMessage: null,
      notification: null,
    },
  }));
}
