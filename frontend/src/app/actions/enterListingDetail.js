import * as API_STATUS from "../../statuses/apiStatus.js";
import * as UI_MODE from "../../constants/uiMode.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";

export async function enterListingDetail({ store, api, payload }) {
    store.setState(
        (state) => (
            {
                ...state,
                ui: {
                    ...state.ui,
                    status: UI_STATUS.LOAD,
                    notification: null,
                },
            }
        )
    );

    const dataResult = store.getState().auth.userId ? await api.listings.getListingAuth(payload.listingId) : await api.listings.getListing(payload.listingId);

    if (dataResult.status !== API_STATUS.OK)
    {
        store.setState((state) => ({
            ...state,
            ui: {
                ...state.ui,
                selectedTicket: null,
                notification: null,
                status: UI_STATUS.ERR,
                errorMessage: 'No data loaded'
            },
        }));
        return;
    }

    const { listing } = dataResult;

    store.setState((state) =>
        {
            return {
                ...state,
                listings: [],
                ui: {
                    ...state.ui,
                    mode: UI_MODE.LISTING_DETAIL,
                    selectedListing: listing,
                    status: UI_STATUS.RDY,
                    selectedTicket: null,
                    errorMessage: null,
                    notification: null,
                },
            }
        }
    );
}
