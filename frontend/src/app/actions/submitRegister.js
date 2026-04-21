import * as ROLE from '../../constants/role.js'
import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';
import * as API_STATUS from '../../statuses/apiStatus.js';
import * as NOTIFICATION_TYPE from '../../statuses/notificationType.js';

export async function submitRegister({ store, api, payload })
{
    const email = payload.email?.trim() ?? '';
    const password = payload.password?.trim() ?? '';
    const username = payload.username?.trim() ?? '';

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

    const registerResult = await api.auth.register(email, password, username);

    if (registerResult.status !== API_STATUS.OK)
    {
        store.setState(
            (state) => (
                {
                    ...state,
                    ui: {
                        ...state.ui,
                        mode: UI_MODE.REGISTER,
                        status: UI_STATUS.RDY,
                        notification: {
                            type: NOTIFICATION_TYPE.ERR,
                            message: registerResult.reason
                        },
                    },
                }
            )
        );
        return;
    }

    store.setState((state) =>
        {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    mode: UI_MODE.LOGIN,
                    status: UI_STATUS.RDY,
                    notification: {
                        type: NOTIFICATION_TYPE.OK,
                        message: `Úspěšně zaregistrován. Nyní se můžete přihlásit!` },
                },
            }
        }
    );
}