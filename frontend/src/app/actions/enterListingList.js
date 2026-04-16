import * as UI_MODE from '../../constants/uiMode.js'
import * as API_STATUS from "../../statuses/apiStatus.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";

export async function enterListingList({ store, api }) {
    const dataResult = await api.listings.getListings({});

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

    const { listings } = dataResult;

    store.setState((state) =>
        {
            return {
                ...state,
                listings,
                ui: {
                    ...state.ui,
                    mode: UI_MODE.LISTING_LIST,
                    selectedExamId: null,
                    status: UI_STATUS.RDY,
                    errorMessage: null,
                },
            }
        }
    );
}
