import * as API_STATUS from "../../statuses/apiStatus.js";

export async function unblockUser({ store, api, payload }) {
  const result = await api.users.unblockUser(payload.userId);
  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      profileUser: state.profileUser
        ? { ...state.profileUser, State: "active" }
        : state.profileUser,
      blockedUsers: (state.blockedUsers ?? []).filter(
        (u) => u.UserID !== payload.userId,
      ),
    }));
  }
  return result;
}
