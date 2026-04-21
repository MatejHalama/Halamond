import * as API_STATUS from "../../statuses/apiStatus.js"
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js"

export async function updateListing({ store, api, payload }) {
    const dataResult = await api.listings.updateListing(payload.listingId, payload);

    if (dataResult.status !== API_STATUS.OK) {
        store.setState((state) => {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    notification: {
                        type: NOTIFICATION_TYPE.WAR,
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
                selectedListing: dataResult.listing,
                notification: {
                    type: NOTIFICATION_TYPE.OK,
                    message: "Úspešně uloženo",
                }
            },
        };
    });
}
