import * as ACTION_TYPE from '../../constants/actionType.js';
import * as VIEW_STATE_TYPE from '../../constants/viewStateType.js';

/*
 ** viewState má tvar
 ** {
 **   type: 'LOADING' | 'ERROR' | EXAM_TERM_LIST | 'EXAM_TERM_DETAIL' | 'EXAM_TERM_ADMINISTRATION',
 **   message?: string ,
 **   exam?: ExamTerm,
 **   exams?: ExamTerm[],
 **   capabilities?: {
 **     canEnterDetail: boolean,
 **     canEnterAdministration: boolean,
 **     canBackToList: boolean,
 **     canCreateExam: boolean,
 **     canRegister: boolean,
 **     canUnregister: boolean,
 **     canPublish: boolean,
 **     canUnpublish: boolean,
 **     canCancel: boolean,
 **     canDelete: boolean,
 **     canUpdateCapacity: boolean,
 **     canUpdate: boolean
 **   },
 ** }
 */

export function createHandlers(dispatch, viewState)
{
    let handlers = {};
    switch (viewState.type) {
        case VIEW_STATE_TYPE.LOGIN:
            handlers = loginHandlers(dispatch);
            break;
        case VIEW_STATE_TYPE.LISTING_LIST:
            handlers = listingListHandlers(dispatch, viewState);
            break;
        case VIEW_STATE_TYPE.LISTING_DETAIL:
            handlers = listingDetailHandlers(dispatch, viewState);
            break;
        case VIEW_STATE_TYPE.PROFILE:
            handlers = userProfileHandlers(dispatch, viewState);
            break;
        case VIEW_STATE_TYPE.ERROR:
            handlers = errorHandlers(dispatch);
            break;
        // TODO: more handlers
    }

    if (viewState.type !== VIEW_STATE_TYPE.LOGIN) {
        handlers.onEnterProfile = () => dispatch({ type: ACTION_TYPE.ENTER_PROFILE });
    }
    return handlers;
}

export function loginHandlers(dispatch)
{
    return {
        onSubmitLogin: (email, password) => dispatch(
            {
                type: ACTION_TYPE.SUBMIT_LOGIN,
                payload: { email, password },
            }
        ),
    };
}

export function listingListHandlers(dispatch, viewState) {
    const { capabilities } = viewState;
    const { canEnterDetail, canEnterAdministration, canCreateListing } = capabilities;

    const handlers = {};

    if (canEnterDetail) {
        handlers.onEnterDetail = (listingId) =>
            dispatch({
                type: ACTION_TYPE.ENTER_LISTING_DETAIL,
                payload: { listingId },
            });
    }

    if (canEnterAdministration) {
        handlers.onEnterAdministration = (listingId) =>
            dispatch({
                type: ACTION_TYPE.ENTER_LISTING_ADMIN,
                payload: { listingId },
            });
    }

    if (canCreateListing) {
        handlers.onCreateListing = (data) =>
            dispatch({
                type: ACTION_TYPE.CREATE_LISTING,
                payload: data,
            });
    }

    return handlers;
}

export function listingDetailHandlers(dispatch, viewState) {
    const { capabilities } = viewState;
    const {
        canBackToList,
        canActivateListing,
        canSellListing,
        canEnterAdministration,
    } = capabilities;
    const handlers = {};
    const listingId = viewState.listing?.ListingID;

    if (!listingId) {
        return handlers;
    }

    if (canBackToList) {
        handlers.onBackToList = () => dispatch({ type: ACTION_TYPE.ENTER_LISTING_LIST });
    }

    if (canActivateListing) {
        handlers.onActivate = () => dispatch({
            type: ACTION_TYPE.ACTIVATE_LISTING,
            payload: { listingId },
        });
    }

    if (canSellListing) {
        handlers.onSell = () => dispatch({
            type: ACTION_TYPE.SELL_LISTING,
            payload: { listingId },
        });
    }

    if (canEnterAdministration) {
        handlers.onEnterAdministration = () => dispatch({
            type: ACTION_TYPE.ENTER_LISTING_ADMIN,
            payload: { listingId },
        });
    }

    return handlers;
}

export function userProfileHandlers(dispatch) {
    return {
        onBackToList: () => dispatch({ type: ACTION_TYPE.ENTER_LISTING_LIST }),
        onLogout: () => dispatch({ type: ACTION_TYPE.LOGOUT }),
    };
}

export function errorHandlers(dispatch) {
    return {
        onContinue: () => dispatch({ type: ACTION_TYPE.ENTER_PROFILE }),
    };
}
