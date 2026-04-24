import * as API_STATUS from "../../statuses/apiStatus.js"

export async function setFilters({ store, api, payload }) {
  const response = payload.categoryId ? await api.categories.getAllSubCategories(payload.categoryId) : null;
  const allSubCategories = response?.status === API_STATUS.OK ? response.categories : [];

  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      filters: {
        ...state.ui.filters,
        ...payload,
        allSubCategories,
      },
    },
  }));
}
