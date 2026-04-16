import { selectViewState } from '../infra/store/selectors.js';
import { createHandlers } from '../app/actionHandlers/createHandlers.js';

import { LoadingView } from './views/LoadingView.js';
import { ErrorView } from './views/ErrorView.js';
import { LoginView } from './views/LoginView.js';
import { UserProfileView } from './views/UserProfileView.js';

import { createSuccessNotification, createErrorNotification } from './builder/layout/notification.js';
import { createUserIcon } from "./builder/layout/user.js";
import { createSection } from './builder/components/section.js';

// TODO: review ./builder
// TODO: review external sources (e.a. css, images, icons)

import * as VIEW_STATE_TYPE from '../constants/viewStateType.js';
import * as NOTIFICATION_TYPE from '../statuses/notificationType.js';
import {ListingListView} from "./views/ListingListView.js";
import {ListingDetailView} from "./views/ListingDetailView.js";

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
export function render(root, state, dispatch)
{
    root.replaceChildren();

    // TODO: selectors
    const viewState = selectViewState(state);
    // TODO: handlers
    const handlers = createHandlers(dispatch, viewState);

    let view;
    switch (viewState.type)
    {
        case VIEW_STATE_TYPE.LOADING:
            view = LoadingView();
            break;

        case VIEW_STATE_TYPE.ERROR:
            view = ErrorView({ message: viewState.message, handlers });
            break;

        case VIEW_STATE_TYPE.LOGIN:
            view = LoginView({ viewState, handlers });
            break;

        case VIEW_STATE_TYPE.LISTING_LIST:
            view = ListingListView({ viewState, handlers });
            break;

        case VIEW_STATE_TYPE.LISTING_DETAIL:
            view = ListingDetailView({ viewState, handlers });
            break;

        case VIEW_STATE_TYPE.PROFILE:
            view = UserProfileView({ viewState, handlers });
            break;

        // TODO: more views

        default:
            view = document.createTextNode(`Unknown view type: ${viewState.type}`);
    }

    root.appendChild(view);

    if (state.auth.userId && viewState.type !== VIEW_STATE_TYPE.PROFILE && viewState.type !== VIEW_STATE_TYPE.LOGIN)
    {
        root.appendChild(createUserIcon(handlers.onEnterProfile));
    }

    const { notification } = state.ui;
    let messages = createSection('notification');
    if (notification)
    {
        const nMessage = notification.message;
        if (nMessage)
        {
            const type = notification.type ?? '';
            switch (type)
            {
                case NOTIFICATION_TYPE.OK:
                    messages.appendChild(createSuccessNotification({ message: nMessage}));
                    break;
                case NOTIFICATION_TYPE.ERR:
                case NOTIFICATION_TYPE.WAR:
                    messages.appendChild(createErrorNotification({ message: nMessage}));
                    break;
                default:
                    messages.appendChild(createSuccessNotification({ message: nMessage}));
                    break;
            }
        }

        state.ui.notification = null;
    }

    root.appendChild(messages);
}
