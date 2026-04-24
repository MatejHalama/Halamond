import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function sendMessage({ store, api, payload }) {
  const { ticketId, message } = payload;

  const result = await api.tickets.sendMessage(ticketId, message);

  if (result.status !== API_STATUS.OK) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedListing: null,
        errorMessage: null,
        notification: { type: NOTIFICATION_TYPE.ERR, message: result.reason },
      },
    }));
    return;
  }

  store.setState((state) => ({
    ...state,
    tickets: state.tickets.map((t) =>
      t.TicketID === ticketId ? { ...t, messages: [result.message] } : t,
    ),
    ui: {
      ...state.ui,
      selectedTicket: state.ui.selectedTicket
        ? {
            ...state.ui.selectedTicket,
            messages: [
              ...(state.ui.selectedTicket.messages ?? []),
              result.message,
            ],
          }
        : state.ui.selectedTicket,
      selectedListing: null,
      errorMessage: null,
      notification: null,
    },
  }));
}
