import {
  selectViewState,
  selectUnreadCount,
  selectUnreadNotificationCount,
  canCreateListing,
} from "../infra/store/selectors.js";
import { createHandlers } from "../app/actionHandlers/createHandlers.js";

import { LoadingView } from "./views/LoadingView.js";
import { ErrorView } from "./views/ErrorView.js";
import { LoginView } from "./views/LoginView.js";
import { UserProfileView } from "./views/UserProfileView.js";
import { CreateListingView } from "./views/CreateListingView.js";
import { AdminView } from "./views/AdminView.js";

import {
  createSuccessNotification,
  createErrorNotification,
} from "./builder/layout/notification.js";
import { createSection } from "./builder/components/section.js";

import * as VIEW_STATE_TYPE from "../constants/viewStateType.js";
import * as ACTION_TYPE from "../constants/actionType.js";
import * as NOTIFICATION_TYPE from "../statuses/notificationType.js";
import * as ROLE from "../constants/role.js";
import { ListingListView } from "./views/ListingListView.js";
import { ListingDetailView } from "./views/ListingDetailView.js";
import { TicketListView } from "./views/TicketListView.js";
import { TicketDetailView } from "./views/TicketDetailView.js";
import { ListingAdministrationView } from "./views/ListingAdministrationView.js";
import { RegisterView } from "./views/RegisterView.js";

function buildNavbar(state, dispatch, viewState) {
  const isAuthView =
    viewState.type === VIEW_STATE_TYPE.LOGIN ||
    viewState.type === VIEW_STATE_TYPE.REGISTER;
  const isLoggedIn = !!state.auth.userId;

  const nav = document.createElement("nav");
  nav.className = "navbar";

  const brand = document.createElement("button");
  brand.className = "navbar-brand";
  brand.textContent = "Halamond";
  brand.addEventListener("click", () =>
    dispatch({ type: ACTION_TYPE.ENTER_LISTING_LIST }),
  );
  nav.appendChild(brand);

  if (!isLoggedIn && !isAuthView) {
    const right = document.createElement("div");
    right.className = "navbar-right";

    const loginBtn = document.createElement("button");
    loginBtn.className = "button button--secondary navbar-btn";
    loginBtn.textContent = "Přihlásit se";
    loginBtn.addEventListener("click", () =>
      dispatch({ type: ACTION_TYPE.ENTER_LOGIN }),
    );
    right.appendChild(loginBtn);

    const registerBtn = document.createElement("button");
    registerBtn.className = "button button--primary navbar-btn";
    registerBtn.textContent = "Registrovat";
    registerBtn.addEventListener("click", () =>
      dispatch({ type: ACTION_TYPE.ENTER_REGISTER }),
    );
    right.appendChild(registerBtn);

    nav.appendChild(right);
  } else if (isLoggedIn && !isAuthView) {
    const right = document.createElement("div");
    right.className = "navbar-right";

    if (canCreateListing(state)) {
      const addBtn = document.createElement("button");
      addBtn.className = "button button--primary navbar-btn";
      addBtn.textContent = "+ Přidat inzerát";
      addBtn.addEventListener("click", () =>
        dispatch({ type: ACTION_TYPE.ENTER_CREATE_LISTING }),
      );
      right.appendChild(addBtn);
    }

    const totalUnread =
      selectUnreadCount(state) + selectUnreadNotificationCount(state);
    const convBtn = document.createElement("button");
    convBtn.className = "button button--secondary navbar-btn";
    convBtn.textContent =
      totalUnread > 0 ? `Zprávy (${totalUnread})` : "Zprávy";
    convBtn.addEventListener("click", () =>
      dispatch({ type: ACTION_TYPE.ENTER_TICKET_LIST }),
    );
    right.appendChild(convBtn);

    if (state.auth.role === ROLE.ADMIN) {
      const adminBtn = document.createElement("button");
      adminBtn.className = "button button--secondary navbar-btn";
      adminBtn.textContent = "Admin";
      adminBtn.addEventListener("click", () =>
        dispatch({ type: ACTION_TYPE.ENTER_ADMIN }),
      );
      right.appendChild(adminBtn);
    }

    const profileBtn = document.createElement("button");
    profileBtn.className =
      "button button--secondary navbar-btn navbar-profile-btn";
    profileBtn.innerHTML = '<i class="fa fa-user"></i>';
    profileBtn.addEventListener("click", () =>
      dispatch({ type: ACTION_TYPE.ENTER_PROFILE }),
    );
    right.appendChild(profileBtn);

    nav.appendChild(right);
  }

  return nav;
}

export function render(root, state, dispatch) {
  root.replaceChildren();

  const viewState = selectViewState(state);
  const handlers = createHandlers(dispatch, viewState);

  root.appendChild(buildNavbar(state, dispatch, viewState));

  const main = document.createElement("main");
  main.className = "main-content";

  let view;
  switch (viewState.type) {
    case VIEW_STATE_TYPE.LOADING:
      view = LoadingView();
      break;

    case VIEW_STATE_TYPE.ERROR:
      view = ErrorView({ message: viewState.message, handlers });
      break;

    case VIEW_STATE_TYPE.LOGIN:
      view = LoginView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.REGISTER:
      view = RegisterView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.LISTING_LIST:
      view = ListingListView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.LISTING_DETAIL:
      view = ListingDetailView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.LISTING_ADMINISTRATION:
      view = ListingAdministrationView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.CREATE_LISTING:
      view = CreateListingView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.PROFILE:
      view = UserProfileView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.TICKET_LIST:
      view = TicketListView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.TICKET_DETAIL:
      view = TicketDetailView({ viewState, handlers });
      break;

    case VIEW_STATE_TYPE.ADMIN:
      view = AdminView({ viewState, handlers });
      break;

    default:
      view = document.createTextNode(`Unknown view type: ${viewState.type}`);
  }

  main.appendChild(view);
  root.appendChild(main);

  const { notification } = state.ui;
  const messages = createSection("toast-container");
  if (notification) {
    const nMessage = notification.message;
    if (nMessage) {
      const type = notification.type ?? "";
      switch (type) {
        case NOTIFICATION_TYPE.OK:
          messages.appendChild(
            createSuccessNotification({ message: nMessage }),
          );
          break;
        case NOTIFICATION_TYPE.ERR:
        case NOTIFICATION_TYPE.WAR:
          messages.appendChild(createErrorNotification({ message: nMessage }));
          break;
        default:
          messages.appendChild(
            createSuccessNotification({ message: nMessage }),
          );
          break;
      }
    }
    dispatch({ type: ACTION_TYPE.CLEAR_NOTIFICATION });
  }
  root.appendChild(messages);
}
