import { urlToAction } from "../infra/router/router.js";
import * as UI_STATUS from "../statuses/uiStatus.js";
import * as ROLE from "../constants/role.js";
import * as API_STATUS from "../statuses/apiStatus.js";

export async function appInit({ store, api, dispatch }) {
  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      status: UI_STATUS.LOAD,
      errorMessage: null,
    },
  }));

  const whoResult = await api.auth.whoAmI();

  const auth = whoResult.status === API_STATUS.OK ? {
    role: whoResult.user.Role,
    userId: whoResult.user.UserID,
    name: whoResult.user.Username,
  } : {
    role: ROLE.ANON,
    userId: null,
    name: null,
  };

  const isLoggedIn = auth.userId !== null;

  const [categoriesResult, ticketsResult] = await Promise.all([
    api.categories.getCategories(),
    isLoggedIn ? api.tickets.getTickets() : Promise.resolve({ status: "SKIP" }),
  ]);

  store.setState((state) => ({
    ...state,
    auth,
    categories:
      categoriesResult.status === API_STATUS.OK
        ? categoriesResult.categories
        : [],
    tickets:
      ticketsResult.status === API_STATUS.OK ? ticketsResult.tickets : [],
    ui: {
      ...state.ui,
      status: UI_STATUS.RDY,
      errorMessage: null,
    },
  }));

  const initialAction = urlToAction(window.location.href);
  dispatch(initialAction);
}
