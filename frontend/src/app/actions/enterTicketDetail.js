import * as UI_MODE from "../../constants/uiMode.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";
import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function enterTicketDetail({ store, api, payload }) {
  const { ticketId } = payload;

  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: UI_STATUS.LOAD },
  }));

  const result = await api.tickets.getTicket(ticketId);

  if (result.status !== API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: UI_STATUS.RDY,
        selectedListing: null,
        errorMessage: null,
        notification: { type: NOTIFICATION_TYPE.ERR, message: result.reason },
      },
    }));
    return;
  }

  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      mode: UI_MODE.TICKET_DETAIL,
      selectedTicket: result.ticket,
      status: UI_STATUS.RDY,
      selectedListing: null,
      errorMessage: null,
      notification: null,
    },
  }));

  const unread = store
    .getState()
    .notifications.filter((n) => !n.Read && n.ticket === ticketId);

  if (unread.length > 0) {
    await Promise.all(
      unread.map((n) => api.notifications.markRead(n.NotificationID)),
    );
    store.setState((state) => ({
      ...state,
      notifications: state.notifications.map((n) =>
        n.ticket === ticketId ? { ...n, Read: true } : n,
      ),
    }));
  }
}
