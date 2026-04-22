export function setFilters({ store, payload }) {
  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      filters: {
        ...state.ui.filters,
        ...payload,
      },
    },
  }));
}
