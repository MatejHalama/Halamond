import * as API_STATUS from "../../statuses/apiStatus.js";
import * as NOTIFICATION_TYPE from "../../statuses/notificationType.js";

export async function closeTicket({ store, api, payload }) {
  const { ticketId } = payload;

  const result = await api.tickets.closeTicket(ticketId);

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
      t.TicketID === ticketId ? { ...t, State: "closed" } : t,
    ),
    ui: {
      ...state.ui,
      selectedTicket: state.ui.selectedTicket
        ? { ...state.ui.selectedTicket, State: "closed" }
        : null,
      selectedListing: null,
      errorMessage: null,
      notification: null,
    },
  }));
}
