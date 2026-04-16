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
    const { canEnterDetail, canEnterAdministration, canCreateExam } = capabilities;

    const handlers = {};

    if (canEnterDetail) {
        handlers.onEnterDetail = (examId) =>
            dispatch({
                type: ACTION_TYPE.ENTER_LISTING_DETAIL,
                payload: { examId },
            });
    }

    // TODO
    /*if (canEnterAdministration) {
        handlers.onEnterAdministration = (examId) =>
            dispatch({
                type: CONST.ENTER_ADMIN,
                payload: { examId },
            });
    }*/

    // TODO
    /*if (canCreateExam) {
        handlers.onCreateExamTerm = (data) =>
            dispatch({
                type: CONST.ENTER_CREATE,
                payload: data,
            });
    }*/

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
