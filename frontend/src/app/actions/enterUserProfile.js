import * as UI_MODE from "../../constants/uiMode.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";
import * as API_STATUS from "../../statuses/apiStatus.js";

export async function enterUserProfile({ store, api }) {
  const { userId } = store.getState().auth;

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: UI_STATUS.LOAD },
  }));

  const result = await api.users.getUser(userId);

  if (result.status !== API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, status: UI_STATUS.ERR, errorMessage: result.reason },
    }));
    return;
  }

  store.setState((state) => ({
    ...state,
    profileUser: result.user,
    ui: {
      ...state.ui,
      mode: UI_MODE.PROFILE,
      status: UI_STATUS.RDY,
      errorMessage: null,
    },
  }));
}
