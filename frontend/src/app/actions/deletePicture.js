import * as API_STATUS from "../../statuses/apiStatus.js";

export async function deletePicture({ store, api, payload }) {
  const { listingId, picId } = payload;
  const result = await api.listings.deletePicture(listingId, picId);

  if (result.status === API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedListing: state.ui.selectedListing
          ? {
              ...state.ui.selectedListing,
              pictures: (state.ui.selectedListing.pictures ?? []).filter(
                (p) => p.PictureID !== picId,
              ),
            }
          : state.ui.selectedListing,
      },
    }));
  }

  return result;
}
