import * as UI_MODE from "../constants/uiMode.js";
import * as UI_STATUS from "../statuses/uiStatus.js";
import * as ROLE from "../constants/role.js";
/*
UI state contract
=================
state.ui = {
  status: 'READY' | 'LOADING' | 'ERROR',
  errorMessage: null | string,
};
READY -> LOADING -> READY
READY -> ERROR
*/

export function createInitialState() {
  return {
    listings: [],
    categories: [],
    tickets: [],
    notifications: [],
    reports: [],
    profileUser: null,

    auth: {
      role: ROLE.ANON,
      userId: null,
      name: null,
    },

    ui: {
      mode: UI_MODE.LOGIN,
      selectedExamId: null,
      selectedListing: null,
      selectedTicket: null,
      filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
      status: UI_STATUS.LOAD,
      errorMessage: null,
      notification: null,
    },
  };
}
