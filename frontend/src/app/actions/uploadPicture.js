import * as API_STATUS from "../../statuses/apiStatus.js";

export async function uploadPicture({ store, api, payload }) {
  const { listingId, file } = payload;
  const result = await api.listings.uploadPicture(listingId, file);

  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedListing: state.ui.selectedListing
          ? {
              ...state.ui.selectedListing,
              pictures: [
                ...(state.ui.selectedListing.pictures ?? []),
                result.picture,
              ],
            }
          : state.ui.selectedListing,
      },
    }));
  }

  return result;
}
