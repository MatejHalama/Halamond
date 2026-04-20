import * as UI_MODE from "../../constants/uiMode.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";
import * as API_STATUS from "../../statuses/apiStatus.js";

export async function enterTicketList({ store, api }) {
  store.setState((state) => ({
    ...state,
    ui: { ...state.ui, status: UI_STATUS.LOAD },
  }));

  const result = await api.tickets.getTickets();

  store.setState((state) => ({
    ...state,
    tickets: result.status === API_STATUS.OK ? result.tickets : state.tickets,
    ui: {
      ...state.ui,
      mode: UI_MODE.TICKET_LIST,
      selectedTicket: null,
      status: UI_STATUS.RDY,
    },
  }));
}
