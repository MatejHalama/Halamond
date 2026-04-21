import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";
import * as API_STATUS from "../../statuses/apiStatus.js";
import * as ROLE from "../../constants/role.js";

export async function enterLogin({ store, api, payload = {}  })
{
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

    if (store.getState().auth?.userId) {
        const whoResult = await api.auth.whoAmI();

        if (whoResult.status === API_STATUS.OK) {
            const auth = {
                role: whoResult.user.Role,
                userId: whoResult.user.UserID,
                name: whoResult.user.Username,
            };
            store.setState((state) =>
                {
                    return {
                        ...state,
                        auth,
                        ui: {
                            ...state.ui,
                            mode: UI_MODE.PROFILE,
                            selectedExamId: null,
                            status: UI_STATUS.RDY,
                            errorMessage: null,
                            notification: {
                                type: NOTIFICATION_TYPE.WAR,
                                message: "Již jste přihlášen",
                            },
                        }
                    }
                }
            );
            return;
        }
    }

    store.setState((state) =>
        {
            let notification = null;

            if (payload?.notification) {
                notification = {
                    type: NOTIFICATION_TYPE.ERR,
                    message: payload.notification,
                };
            }

            return {
                ...state,
                ui: {
                    ...state.ui,
                    mode: UI_MODE.LOGIN,
                    selectedExamId: null,
                    status: UI_STATUS.RDY,
                    errorMessage: null,
                    notification: notification,
                }
            }
        }
    );
}
