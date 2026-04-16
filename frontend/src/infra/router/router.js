import * as UI_MODE from '../../constants/uiMode.js'
import * as ACTION_TYPE from '../../constants/actionType.js';
import * as URLS from '../../constants/urls.js';

const UNKNOWN = 'UNKNOWN';

// --------------------------------------------------
// Navigační kontexty jsou:
//
// TODO: aktualizovat adresy
//
//   #/login                 ... přihlášení
//   #/exam-terms            ... seznam termínů
//   #/exam-terms/:id        ... detail termínu
//   #/exam-terms/:id/edit   ... administrace termínu
//   #/profile               ... profil uživatele
// --------------------------------------------------

// URL -> route
export function urlToRoute(url) {
    const hashIndex = url.indexOf('#');
    const path = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
    return parseUrl(path);
}

export function parseUrl(path) {
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) {
        return { context: UI_MODE.LISTING_LIST };
    }

    if (parts.length === 1 && parts[0] === URLS.LOGIN) {
        return { context: UI_MODE.LOGIN };
    }

    if (parts.length === 1 && parts[0] === URLS.LISTING_LIST) {
        return { context: UI_MODE.LISTING_LIST };
    }

    if (parts.length === 2 && parts[0] === URLS.LISTING_DETAIL) {
        return { context: UI_MODE.LISTING_DETAIL, listingId: parts[1] };
    }

    if (parts.length === 1 && parts[0] === URLS.PROFILE) {
        return { context: UI_MODE.PROFILE };
    }

    // TODO: more urls

    return { context: UNKNOWN };
}

export function routeToAction(route) {
    switch (route.context) {
        case UI_MODE.LOGIN:
            return { type: ACTION_TYPE.ENTER_LOGIN };
        case UI_MODE.PROFILE:
            return { type: ACTION_TYPE.ENTER_PROFILE };
        case UI_MODE.LISTING_LIST:
            return { type: ACTION_TYPE.ENTER_LISTING_LIST };
        case UI_MODE.LISTING_DETAIL:
            return { type: ACTION_TYPE.ENTER_LISTING_DETAIL, payload: {listingId: route.listingId} };
        // TODO: more ui modes
        case UNKNOWN:
            return { type: ACTION_TYPE.ENTER_PROFILE };
    }
}

export function urlToAction(url) {
    const route = urlToRoute(url);
    return routeToAction(route);
}

export function stateToPath(state) {
    const { mode, selectedListing } = state.ui ?? {};

    switch (mode) {
        case UI_MODE.LOGIN:
            return `/${URLS.LOGIN}`;
        case UI_MODE.PROFILE:
            return `/${URLS.PROFILE}`;
        case UI_MODE.LISTING_LIST:
            return `/${URLS.LISTING_LIST}`;
        case UI_MODE.LISTING_DETAIL:
            return selectedListing ? `/${URLS.LISTING_DETAIL}/${selectedListing.ListingID}` : `/${URLS.LISTING_DETAIL}`;
        // TODO: more ui modes
        default:
            return `/${URLS.PROFILE}`;
    }
}

export function stateToUrl(state) {
    return `#${stateToPath(state)}`;
}

export function syncUrlWithState(state, { replace = false } = {}) {
    const nextUrl = stateToUrl(state);
    const currentUrl = window.location.hash || '#';

    if (currentUrl === nextUrl) {
        return;
    }

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ path: nextUrl }, '', nextUrl);
}
