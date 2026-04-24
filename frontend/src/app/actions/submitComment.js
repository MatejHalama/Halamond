import * as API_STATUS from "../../statuses/apiStatus.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function submitComment({ store, api, payload }) {
    const result = await api.listings.commentListing(store.getState().ui.selectedListing.ListingID, payload);

    if (result.status !== API_STATUS.OK) {
        store.setState((state) => {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    selectedTicket: null,
                    errorMessage: null,
                    notification: {
                        type: NOTIFICATION_TYPE.ERR,
                        message: result.reason,
                    },
                },
            };
        });
        return;
    }

    const dataResult = await api.listings.getListingAuth(store.getState().ui.selectedListing.ListingID);

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

    store.setState((state) =>
        {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    selectedListing: dataResult.listing,
                    status: UI_STATUS.RDY,
                    selectedTicket: null,
                    errorMessage: null,
                    notification: {
                        type: NOTIFICATION_TYPE.OK,
                        message: "Komentář úspěšně odeslán",
                    },
                },
            }
        }
    );
}
