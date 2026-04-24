import * as ROLE from '../../constants/role.js'
import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';
import * as API_STATUS from '../../statuses/apiStatus.js';
import * as NOTIFICATION_TYPE from '../../statuses/notificationType.js';

export async function submitLogin({ store, api, payload })
{
    const email = payload.email?.trim() ?? '';
    const password = payload.password?.trim() ?? '';

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

    const loginResult = await api.auth.login(email, password);

    if (loginResult.status !== API_STATUS.OK)
    {
        store.setState(
            (state) => (
                {
                    ...state,
                    auth: { role: ROLE.ANON, userId: null, name: null },
                    ui: {
                        ...state.ui,
                        status: UI_STATUS.RDY,
                        selectedListing: null,
                        selectedTicket: null,
                        errorMessage: null,
                        notification: {
                            type: NOTIFICATION_TYPE.ERR,
                            message: loginResult.reason
                        },
                    },
                }
            )
        );
        return;
    }

    const auth = {
        role: loginResult.user.role,
        userId: loginResult.user.userId,
        name: loginResult.user.username,
    };

    store.setState((state) =>
        {
            return {
                ...state,
                auth,
                ui: {
                    ...state.ui,
                    mode: UI_MODE.LISTING_LIST,
                    status: UI_STATUS.RDY,
                    selectedListing: null,
                    selectedTicket: null,
                    errorMessage: null,
                    notification: {
                        type: NOTIFICATION_TYPE.OK,
                        message: `Přihlášen jako ${auth.name}` },
                },
            }
        }
    );
}