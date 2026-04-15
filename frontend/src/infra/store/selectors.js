import * as VIEW_STATE_TYPE from '../../constants/viewStateType.js'
import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';

export function selectLoginView(state)
{
    return {
        type: VIEW_STATE_TYPE.LOGIN,
        capabilities: {},
    };
}

export function selectProfileView(state)
{
    return {
        type: VIEW_STATE_TYPE.PROFILE,
        user: state.auth,
        capabilities: {
            canBackToList: false,
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
        // TODO: more ui modes
        default:
            return {
                type: VIEW_STATE_TYPE.ERROR,
                message: 'not known view.' };
    }
}
