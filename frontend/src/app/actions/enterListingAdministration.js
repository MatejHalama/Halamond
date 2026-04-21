import * as API_STATUS from "../../statuses/apiStatus.js";
import * as UI_MODE from "../../constants/uiMode.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";

export async function enterListingAdministration({ store, api, payload }) {
    const dataResult = await api.listings.getListingAuth(payload.listingId);

    if (dataResult.status !== API_STATUS.OK)
    {
        store.setState((state) => ({
            ...state,
            ui: {
                ...state.ui,
                status: UI_STATUS.ERR,
                errorMessage: 'No data loaded'
            },
        }));
        return;
    }

    store.setState((state) =>
        {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    mode: UI_MODE.LISTING_ADMINISTRATION,
                    selectedListing: dataResult.listing,
                    status: UI_STATUS.RDY,
                    errorMessage: null,
                },
            }
        }
    );
}
