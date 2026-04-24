import * as API_STATUS from "../../statuses/apiStatus.js";

export async function createCategory({ store, api, payload }) {
  const { name, parentId } = payload;
  const result = await api.categories.createCategory(name, parentId);

  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      adminCategories: [...(state.adminCategories ?? []), result.category],
    }));
  }

  return result;
}
