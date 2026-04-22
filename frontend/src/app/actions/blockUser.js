import * as API_STATUS from "../../statuses/apiStatus.js";

export async function blockUser({ store, api, payload }) {
  const result = await api.users.blockUser(payload.userId);
  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      profileUser: state.profileUser ? { ...state.profileUser, State: "blocked" } : state.profileUser,
    }));
  }
  return result;
}
