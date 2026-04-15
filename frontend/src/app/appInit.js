import { urlToAction } from '../infra/router/router.js';
import * as UI_STATUS from '../statuses/uiStatus.js';
import * as UI_MODE from '../constants/uiMode.js';
import * as ACTION_TYPE from '../constants/actionType.js';
import * as ROLE from '../constants/role.js';
import * as API_STATUS from '../statuses/apiStatus.js';

export async function appInit({ store, api, dispatch })
{
    store.setState((state) => ({
        ...state,
        ui: {
            ...state.ui,
            status: UI_STATUS.LOAD,
            errorMessage: null
        },
    }));

    const whoResult = await api.auth.whoAmI();

    if (whoResult.status !== API_STATUS.OK)
    {
        store.setState((state) => ({
            ...state,
            auth: {
                role: ROLE.ANON,
                userId: null,
                name: null },
            ui: {
                ...state.ui,
                mode: UI_MODE.LOGIN,
                status: UI_STATUS.RDY,
                errorMessage: 'Login again'
            },
        }));
        dispatch({ type: ACTION_TYPE.ENTER_LOGIN });
        return;
    }

    const auth = {
        role: whoResult.user.Role,
        userId: whoResult.user.UserID,
        name: whoResult.user.Username,
    };

    // TODO: get data

    store.setState((state) => ({
        ...state,
        auth,
        //exams,
        //registrations,
        ui: {
            ...state.ui,
            status: UI_STATUS.RDY,
            errorMessage: null
        },
    }));

    const initialAction = urlToAction(window.location.href);
    dispatch(initialAction);
}
