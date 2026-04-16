import * as VIEW_STATE_TYPE from '../../constants/viewStateType.js'
import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';
import * as ROLE from '../../constants/role.js';

/* ****************************************** */
/*
 *  rozhodování o capabilities
 *
 */
/* ****************************************** */

export function canCreateListing(state)
{
    // TODO: check if user is not blocked
    const { role } = state.auth;
    return role === ROLE.USER;
}

export function canUpdateListing(state)
{
    const { role, userId } = state.auth;
    if (role !== ROLE.USER) return false;

    const listing = state.ui.selectedListing ?? null;
    if (!listing) return false;

    if (listing.author === userId) return false;

    return listing.Status === "draft" || listing.Status === "active";
}

export function canActivateListing(state)
{
    const { role, userId } = state.auth;
    if (role !== ROLE.USER) return false;

    const listing = state.ui.selectedListing ?? null;
    if (!listing) return false;

    if (listing.author === userId) return false;

    return listing.Status === "draft" || listing.Status === "sold";
}

export function canSellListing(state)
{
    const { role, userId } = state.auth;
    if (role !== ROLE.USER) return false;

    const listing = state.ui.selectedListing ?? null;
    if (!listing) return false;

    if (listing.author === userId) return false;

    return listing.Status === "active";
}

/*export function canEnterAdministration(state)
{
    const { role } = state.auth;
    return role === ROLE.TEACHER;
}*/

/**/

export function selectListings(state)
{
    return state.listings ?? [];
}

export function selectLoginView(state)
{
    return {
        type: VIEW_STATE_TYPE.LOGIN,
        capabilities: {},
    };
}

export function selectListingListView(state)
{
    const listings = selectListings(state);
    return {
        type: VIEW_STATE_TYPE.LISTING_LIST,
        listings,
        // TODO: capabilities
        capabilities: {
            canEnterDetail: true,
            //canEnterAdministration: canEnterAdministration(state),
            canCreateListing: canCreateListing(state),
        },
    };
}

export function selectExamTermDetailView(state)
{
    return {
        type: VIEW_STATE_TYPE.LISTING_DETAIL,
        listing: state.ui.selectedListing ?? null,
        // TODO: capabilities
        capabilities: {
            canBackToList: true,
            //canEnterAdministration: canEnterAdministration(state),
            canActivateListing: canActivateListing(state),
            canSellListing: canSellListing(state),
        },
    };
}

export function selectProfileView(state)
{
    return {
        type: VIEW_STATE_TYPE.PROFILE,
        user: state.auth,
        capabilities: {
            canBackToList: true,
            canLogout: true,
        },
    };
}

/*
 ** vrací objekt ve tvaru
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
export function selectViewState(state) {
    if (state.ui.status === UI_STATUS.LOAD) {
        return { type: VIEW_STATE_TYPE.LOADING };
    }

    if (state.ui.status === UI_STATUS.ERR) {
        return {
            type: VIEW_STATE_TYPE.ERROR,
            message:
                state.ui.errorMessage ?? 'error.' };
    }

    switch (state.ui.mode) {
        case UI_MODE.LOGIN:
            return selectLoginView(state);
        case UI_MODE.PROFILE:
            return selectProfileView(state);
        case UI_MODE.LISTING_LIST:
            return selectListingListView(state);
        case UI_MODE.LISTING_DETAIL:
            return selectExamTermDetailView(state);
        // TODO: more ui modes
        default:
            return {
                type: VIEW_STATE_TYPE.ERROR,
                message: 'not known view.' };
    }
}
