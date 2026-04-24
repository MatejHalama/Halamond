import { appInit } from "./appInit.js";

import { enterLogin } from "./actions/enterLogin.js";
import { submitLogin } from "./actions/submitLogin.js";
import { logout } from "./actions/logout.js";

import { enterUserProfile } from "./actions/enterUserProfile.js";

import * as ACTION_TYPE from "../constants/actionType.js";
import { enterListingList } from "./actions/enterListingList.js";
import { enterListingDetail } from "./actions/enterListingDetail.js";
import { createListing } from "./actions/createListing.js";
import { activateListing } from "./actions/activateListing.js";
import { enterTicketList } from "./actions/enterTicketList.js";
import { enterTicketDetail } from "./actions/enterTicketDetail.js";
import { contactSeller } from "./actions/contactSeller.js";
import { sendMessage } from "./actions/sendMessage.js";
import { closeTicket } from "./actions/closeTicket.js";
import { sellListing } from "./actions/sellListing.js";
import { deleteListing } from "./actions/deleteListing.js";
import { enterListingAdministration } from "./actions/enterListingAdministration.js";
import { updateListing } from "./actions/updateListing.js";
import { enterRegister } from "./actions/enterRegister.js";
import { submitRegister } from "./actions/submitRegister.js";
import { setFilters } from "./actions/setFilters.js";
import { submitRating } from "./actions/submitRating.js";
import { submitReport } from "./actions/submitReport.js";
import { blockUser } from "./actions/blockUser.js";
import { unblockUser } from "./actions/unblockUser.js";
import { blockListing } from "./actions/blockListing.js";
import { enterCreateListing } from "./actions/enterCreateListing.js";
import { enterAdmin } from "./actions/enterAdmin.js";
import { dismissReport } from "./actions/dismissReport.js";
import { uploadPicture } from "./actions/uploadPicture.js";
import { deletePicture } from "./actions/deletePicture.js";

function isAuthenticated(state) {
  return !!state.auth?.userId;
}

function isPublicAction(type) {
  return [
    ACTION_TYPE.ENTER_LOGIN,
    ACTION_TYPE.SUBMIT_LOGIN,
    ACTION_TYPE.ENTER_REGISTER,
    ACTION_TYPE.SUBMIT_REGISTER,
    ACTION_TYPE.ENTER_LISTING_LIST,
    ACTION_TYPE.ENTER_LISTING_DETAIL,
    ACTION_TYPE.SET_FILTERS,
    ACTION_TYPE.INIT,
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

    if (!isPublicAction(action.type) && !isAuthenticated(currentState)) {
      return dispatch({
        type: ACTION_TYPE.ENTER_LOGIN,
        payload: {
          notification: "For access to page you have to log in",
        },
        meta: {
          syncUrl: false,
        },
      });
    }

    const { type, payload = {}, meta = {} } = action ?? {};
    let result;

    switch (type) {
      case ACTION_TYPE.INIT:
        result = await appInit({ store, api, dispatch });
        break;

      case ACTION_TYPE.ENTER_LOGIN:
        result = await enterLogin({ store, api, payload });
        break;

      case ACTION_TYPE.SUBMIT_LOGIN:
        result = await submitLogin({ store, api, payload });
        break;

      case ACTION_TYPE.ENTER_REGISTER:
        result = await enterRegister({ store, api, payload });
        break;

      case ACTION_TYPE.SUBMIT_REGISTER:
        result = await submitRegister({ store, api, payload });
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

      case ACTION_TYPE.ENTER_LISTING_ADMINISTRATION:
        result = await enterListingAdministration({ store, api, payload });
        break;

      case ACTION_TYPE.CREATE_LISTING:
        result = await createListing({ store, api, payload });
        break;

      case ACTION_TYPE.UPDATE_LISTING:
        result = await updateListing({ store, api, payload });
        break;

      case ACTION_TYPE.ACTIVATE_LISTING:
        result = await activateListing({ store, api, payload });
        break;

      case ACTION_TYPE.SELL_LISTING:
        result = await sellListing({ store, api, payload });
        break;

      case ACTION_TYPE.DELETE_LISTING:
        result = await deleteListing({ store, api, payload });
        break;

      case ACTION_TYPE.ENTER_PROFILE:
        result = await enterUserProfile({ store, api, payload });
        break;

      case ACTION_TYPE.ENTER_TICKET_LIST:
        result = await enterTicketList({ store, api });
        break;

      case ACTION_TYPE.ENTER_TICKET_DETAIL:
        result = await enterTicketDetail({ store, api, payload });
        break;

      case ACTION_TYPE.CONTACT_SELLER:
        result = await contactSeller({ store, api, dispatch, payload });
        break;

      case ACTION_TYPE.SEND_MESSAGE:
        result = await sendMessage({ store, api, payload });
        break;

      case ACTION_TYPE.CLOSE_TICKET:
        result = await closeTicket({ store, api, payload });
        break;

      case ACTION_TYPE.SET_FILTERS:
        result = setFilters({ store, payload });
        break;

      case ACTION_TYPE.SUBMIT_RATING:
        result = await submitRating({ store, api, payload });
        break;

      case ACTION_TYPE.SUBMIT_REPORT:
        result = await submitReport({ api, payload });
        break;

      case ACTION_TYPE.BLOCK_USER:
        result = await blockUser({ store, api, payload });
        break;

      case ACTION_TYPE.UNBLOCK_USER:
        result = await unblockUser({ store, api, payload });
        break;

      case ACTION_TYPE.BLOCK_LISTING:
        result = await blockListing({ store, api, payload });
        break;

      case ACTION_TYPE.ENTER_CREATE_LISTING:
        result = enterCreateListing({ store });
        break;

      case ACTION_TYPE.ENTER_ADMIN:
        result = await enterAdmin({ store, api });
        break;

      case ACTION_TYPE.DISMISS_REPORT:
        result = await dismissReport({ store, api, payload });
        break;

      case ACTION_TYPE.UPLOAD_PICTURE:
        result = await uploadPicture({ store, api, payload });
        break;

      case ACTION_TYPE.DELETE_PICTURE:
        result = await deletePicture({ store, api, payload });
        break;

      default:
        console.warn(`Unknown action type: ${type}`);
        return;
    }

    return result;
  };
}
