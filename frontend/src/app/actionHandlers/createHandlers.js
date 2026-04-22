import * as ACTION_TYPE from "../../constants/actionType.js";
import * as VIEW_STATE_TYPE from "../../constants/viewStateType.js";

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

export function createHandlers(dispatch, viewState) {
  let handlers = {};
  switch (viewState.type) {
    case VIEW_STATE_TYPE.LOGIN:
      handlers = loginHandlers(dispatch);
      break;
    case VIEW_STATE_TYPE.REGISTER:
      handlers = registerHandlers(dispatch);
      break;
    case VIEW_STATE_TYPE.LISTING_LIST:
      handlers = listingListHandlers(dispatch, viewState);
      break;
    case VIEW_STATE_TYPE.LISTING_DETAIL:
      handlers = listingDetailHandlers(dispatch, viewState);
      break;
    case VIEW_STATE_TYPE.LISTING_ADMINISTRATION:
      handlers = listingAdministrationHandlers(dispatch, viewState);
      break;
    case VIEW_STATE_TYPE.PROFILE:
      handlers = userProfileHandlers(dispatch, viewState);
      break;
    case VIEW_STATE_TYPE.ERROR:
      handlers = errorHandlers(dispatch);
      break;
    case VIEW_STATE_TYPE.TICKET_LIST:
      handlers = ticketListHandlers(dispatch, viewState);
      break;
    case VIEW_STATE_TYPE.TICKET_DETAIL:
      handlers = ticketDetailHandlers(dispatch, viewState);
      break;
    // TODO: more handlers
  }

  if (
    viewState.type !== VIEW_STATE_TYPE.LOGIN &&
    viewState.type !== VIEW_STATE_TYPE.REGISTER
  ) {
    handlers.onEnterProfile = () =>
      dispatch({ type: ACTION_TYPE.ENTER_PROFILE });
  }
  return handlers;
}

export function loginHandlers(dispatch) {
  return {
    onSubmitLogin: (email, password) =>
      dispatch({
        type: ACTION_TYPE.SUBMIT_LOGIN,
        payload: { email, password },
      }),
    onEnterRegister: () =>
      dispatch({
        type: ACTION_TYPE.ENTER_REGISTER,
      }),
  };
}

export function registerHandlers(dispatch) {
  return {
    onSubmitRegister: (email, password, username) =>
      dispatch({
        type: ACTION_TYPE.SUBMIT_REGISTER,
        payload: { email, password, username },
      }),
    onEnterLogin: () =>
      dispatch({
        type: ACTION_TYPE.ENTER_LOGIN,
      }),
  };
}

export function listingListHandlers(dispatch, viewState) {
  const { capabilities } = viewState;
  const { canEnterDetail, canEnterAdministration, canCreateListing } =
    capabilities;

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
        type: ACTION_TYPE.ENTER_LISTING_ADMINISTRATION,
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

  handlers.onEnterTicketList = () =>
    dispatch({ type: ACTION_TYPE.ENTER_TICKET_LIST });

  handlers.onSetFilters = (filters) =>
    dispatch({ type: ACTION_TYPE.SET_FILTERS, payload: filters });

  handlers.onOpenNotification = (ticketId) =>
    dispatch({ type: ACTION_TYPE.ENTER_TICKET_DETAIL, payload: { ticketId } });

  return handlers;
}

export function listingDetailHandlers(dispatch, viewState) {
  const { capabilities } = viewState;
  const {
    canBackToList,
    canActivateListing,
    canSellListing,
    canDeleteListing,
    canEnterAdministration,
    canViewSellerProfile,
    canReportListing,
    canBlockListing,
  } = capabilities;
  const handlers = {};
  const listingId = viewState.listing?.ListingID;

  if (!listingId) {
    return handlers;
  }

  if (canBackToList) {
    handlers.onBackToList = () =>
      dispatch({ type: ACTION_TYPE.ENTER_LISTING_LIST });
  }

  if (canActivateListing) {
    handlers.onActivate = () =>
      dispatch({
        type: ACTION_TYPE.ACTIVATE_LISTING,
        payload: { listingId },
      });
  }

  if (canSellListing) {
    handlers.onSell = () =>
      dispatch({
        type: ACTION_TYPE.SELL_LISTING,
        payload: { listingId },
      });
  }

  if (canDeleteListing) {
    handlers.onDelete = () =>
      dispatch({
        type: ACTION_TYPE.DELETE_LISTING,
        payload: { listingId },
      });
  }

  if (canEnterAdministration) {
    handlers.onEnterAdministration = () =>
      dispatch({
        type: ACTION_TYPE.ENTER_LISTING_ADMINISTRATION,
        payload: { listingId },
      });
  }

  const { canContactSeller } = capabilities;
  if (canContactSeller) {
    handlers.onContactSeller = (id, message) =>
      dispatch({
        type: ACTION_TYPE.CONTACT_SELLER,
        payload: { listingId: id, message },
      });
  }

  handlers.onEnterTicketList = () =>
    dispatch({ type: ACTION_TYPE.ENTER_TICKET_LIST });

  if (canViewSellerProfile) {
    handlers.onEnterSellerProfile = (userId) =>
      dispatch({ type: ACTION_TYPE.ENTER_PROFILE, payload: { userId } });
  }

  if (canReportListing) {
    handlers.onReportListing = (text) =>
      dispatch({
        type: ACTION_TYPE.SUBMIT_REPORT,
        payload: { text, reportedListingId: listingId },
      });
  }

  if (canBlockListing) {
    handlers.onBlockListing = () =>
      dispatch({
        type: ACTION_TYPE.BLOCK_LISTING,
        payload: { listingId },
      });
  }

  return handlers;
}

export function listingAdministrationHandlers(dispatch, viewState) {
  const { capabilities } = viewState;
  const { canBackToList, canUpdateListing } = capabilities;
  const handlers = {};
  const listingId = viewState.listing?.ListingID;

  if (!listingId) return handlers;

  if (canBackToList) {
    handlers.onBackToList = () =>
      dispatch({ type: ACTION_TYPE.ENTER_LISTING_LIST });
  }

  if (canUpdateListing) {
    handlers.onUpdate = (data) =>
      dispatch({
        type: ACTION_TYPE.UPDATE_LISTING,
        payload: { listingId, ...data },
      });
  }

  return handlers;
}

export function ticketListHandlers(dispatch, viewState) {
  return {
    onBackToListings: () => dispatch({ type: ACTION_TYPE.ENTER_LISTING_LIST }),
    onEnterDetail: (ticketId) =>
      dispatch({
        type: ACTION_TYPE.ENTER_TICKET_DETAIL,
        payload: { ticketId },
      }),
  };
}

export function ticketDetailHandlers(dispatch, viewState) {
  const { canSendMessage, canCloseTicket, canRateSeller } =
    viewState.capabilities;
  const handlers = {
    onBackToTickets: () => dispatch({ type: ACTION_TYPE.ENTER_TICKET_LIST }),
  };

  if (canSendMessage) {
    handlers.onSendMessage = (ticketId, message) =>
      dispatch({
        type: ACTION_TYPE.SEND_MESSAGE,
        payload: { ticketId, message },
      });
  }

  if (canCloseTicket) {
    handlers.onCloseTicket = (ticketId) =>
      dispatch({
        type: ACTION_TYPE.CLOSE_TICKET,
        payload: { ticketId },
      });
  }

  if (canRateSeller) {
    handlers.onRateSeller = (reviewedId, rating) =>
      dispatch({
        type: ACTION_TYPE.SUBMIT_RATING,
        payload: { reviewedId, rating },
      });
  }

  return handlers;
}

export function userProfileHandlers(dispatch, viewState) {
  const { canReportUser, canBlockUser, canUnblockUser } = viewState.capabilities;
  const handlers = {
    onBackToList: () => dispatch({ type: ACTION_TYPE.ENTER_LISTING_LIST }),
    onLogout: () => dispatch({ type: ACTION_TYPE.LOGOUT }),
  };

  if (canReportUser) {
    handlers.onReportUser = (userId, text) =>
      dispatch({
        type: ACTION_TYPE.SUBMIT_REPORT,
        payload: { text, reportedUserId: userId },
      });
  }

  if (canBlockUser) {
    handlers.onBlockUser = (userId) =>
      dispatch({
        type: ACTION_TYPE.BLOCK_USER,
        payload: { userId },
      });
  }

  if (canUnblockUser) {
    handlers.onUnblockUser = (userId) =>
      dispatch({
        type: ACTION_TYPE.UNBLOCK_USER,
        payload: { userId },
      });
  }

  return handlers;
}

export function errorHandlers(dispatch) {
  return {
    onContinue: () => dispatch({ type: ACTION_TYPE.ENTER_PROFILE }),
  };
}
