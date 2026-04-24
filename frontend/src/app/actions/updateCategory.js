import * as API_STATUS from "../../statuses/apiStatus.js";

export async function updateCategory({ store, api, payload }) {
  const { categoryId, name, parentId } = payload;
  const result = await api.categories.updateCategory(
    categoryId,
    name,
    parentId,
  );

  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      adminCategories: (state.adminCategories ?? []).map((c) =>
        c.CategoryID === categoryId
          ? {
              ...c,
              Name: result.category.Name,
              parentCategory: result.category.parentCategory,
            }
          : c,
      ),
    }));
  }

  return result;
}
