import * as API_STATUS from "../../statuses/apiStatus.js";

export async function deleteCategory({ store, api, payload }) {
  const { categoryId } = payload;
  const result = await api.categories.deleteCategory(categoryId);

  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      adminCategories: (state.adminCategories ?? []).filter(
        (c) => c.CategoryID !== categoryId,
      ),
    }));
  }

  return result;
}
