import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function enterRegister({ store, payload = {}  })
{
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
                    mode: UI_MODE.REGISTER,
                    selectedExamId: null,
                    status: UI_STATUS.RDY,
                    errorMessage: null,
                    notification: notification,
                }
            }
        }
    );
}
