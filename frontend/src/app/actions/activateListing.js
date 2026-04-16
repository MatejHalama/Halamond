import * as UI_MODE from "../../constants/uiMode.js"
import * as API_STATUS from "../../statuses/apiStatus.js"

export async function activateListing({ store, api, payload }) {
    const dataResult = await api.listings.ac(payload.listingId);

    if (dataResult.status !== API_STATUS.OK) {
        store.setState((state) => {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    notification: {
                        type: "WARNING",
                        message: dataResult.reason,
                    }
                },
            };
        });
    }

    store.setState((state) => {
        return {
            ...state,
            ui: {
                ...state.ui,
                mode: UI_MODE.LISTING_DETAIL,
                selectedListing: dataResult.listings,
            },
        };
    });
}
