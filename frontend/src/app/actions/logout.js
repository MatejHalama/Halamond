import * as ROLE from '../../constants/role.js';
import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';
import * as API_STATUS from '../../statuses/apiStatus.js';
import * as NOTIFICATION_TYPE from '../../statuses/notificationType.js';

export async function logout({ store, api })
{
    const logoutResult = await api.auth.logout();

    store.setState((state) =>
        {
            let notification;
            if (logoutResult.status === API_STATUS.OK)
                notification = { type: NOTIFICATION_TYPE.OK, message: 'Byl(a) jste odhlášen(a).' }
            else
                notification = { type: NOTIFICATION_TYPE.ERR, message: logoutResult.reason}

            return {
                ...state,
                myListings: [],
                tickets: [],
                notifications: [],
                reports: [],
                profileUser: null,
                auth: { role: ROLE.ANON, userId: null, name: null },
                ui: {
                    ...state.ui,
                    mode: UI_MODE.LOGIN,
                    status: UI_STATUS.RDY,
                    selectedListing: null,
                    selectedTicket: null,
                    errorMessage: null,
                    notification,
                }
            }
        }
    );
}
