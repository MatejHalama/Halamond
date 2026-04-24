import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";
import * as ACTION_TYPE from "../../constants/actionType.js";

export async function contactSeller({ store, api, dispatch, payload }) {
  const { listingId, message } = payload;

  const result = await api.tickets.createTicket(listingId, message);

  if (result.status !== API_STATUS.OK) {
    if (result.ticketId) {
      return dispatch({
        type: ACTION_TYPE.ENTER_TICKET_DETAIL,
        payload: { ticketId: result.ticketId },
      });
    }

    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedTicket: null,
        errorMessage: null,
        notification: { type: NOTIFICATION_TYPE.ERR, message: result.reason },
      },
    }));
    return;
  }

  return dispatch({
    type: ACTION_TYPE.ENTER_TICKET_DETAIL,
    payload: { ticketId: result.ticket.TicketID },
  });
}
