import { appInit } from './appInit.js';

import { enterLogin } from './actions/enterLogin.js';
import { submitLogin } from './actions/submitLogin.js';
import { logout } from './actions/logout.js';

import { enterUserProfile } from './actions/enterUserProfile.js';

import * as ACTION_TYPE from '../constants/actionType.js';
import { syncUrlWithState } from '../infra/router/router.js';
import {enterListingList} from "./actions/enterListingList.js";
import {enterListingDetail} from "./actions/enterListingDetail.js";
import {createListing} from "./actions/createListing.js";
import {activateListing} from "./actions/activateListing.js";


function isAuthenticated(state) {
    return !!state.auth?.userId;
}

function isPublicAction(type) {
    return [
        ACTION_TYPE.ENTER_LOGIN,
        ACTION_TYPE.SUBMIT_LOGIN,
        ACTION_TYPE.ENTER_LISTING_LIST,
        ACTION_TYPE.INIT
    ].includes(type);
}

/**
 * Vytvoří funkci dispatch, která podle typu akce vrací výsledek výkonného kódu akce.
 * Příklad:
 * pro typ akce 'ENTER_EXAM_TERM_DETAIL'
 bude funke dispatch vracet výsledek funkce enterExamTermDetail({ store, payload: action.payload })
 *
 */
export function createDispatcher(store, api) {
    return async function dispatch(action) {
        const currentState = store.getState();

        if (!isPublicAction(action.type) && !isAuthenticated(currentState))
        {
            window.history.replaceState({}, '', '#/login');

            return dispatch({
                type: ACTION_TYPE.ENTER_LOGIN,
                payload: {
                    notification: 'For access to page you have to log in',
                },
                meta: {
                    syncUrl: false,
                }
            });
        }

        const { type, payload = {}, meta = {} } = action ?? {};
        let result;

        switch (type) {
            case ACTION_TYPE.INIT:
                result = await appInit({ store, api, dispatch });
                break;

            case ACTION_TYPE.ENTER_LOGIN:
                result = await enterLogin({ store, payload });
                break;

            case ACTION_TYPE.SUBMIT_LOGIN:
                result = await submitLogin({ store, api, payload});
                break;

            case ACTION_TYPE.LOGOUT:
                result = await logout({ store, api });
                break;

            case ACTION_TYPE.ENTER_LISTING_LIST:
                result = await enterListingList({ store, api });
                break;

            case ACTION_TYPE.ENTER_LISTING_DETAIL:
                result = await enterListingDetail({ store, api, payload });
                break;

            case ACTION_TYPE.CREATE_LISTING:
                result = await createListing({ store, api, payload });
                break;

            case ACTION_TYPE.ACTIVATE_LISTING:
                result = await activateListing({ store, api, payload });
                break;

            case ACTION_TYPE.ENTER_PROFILE:
                result = await enterUserProfile({ store });
                break;

            // TODO: actions

            default:
                console.warn(`Unknown action type: ${type}`);
                return;
        }

        if (action?.meta?.syncUrl !== false) {
            syncUrlWithState(store.getState());
        }

        return result;

    };
}
