import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { createDiv } from "../builder/components/div.js";
import { addActionButton } from "../builder/components/button.js";

export function TicketListView({ viewState, handlers }) {
  const { tickets, auth, capabilities } = viewState;
  const { onEnterDetail, onBackToListings } = handlers;

  const root = createSection("ticket-list-view");
  root.appendChild(
    addActionButton(onBackToListings, "← Inzeráty", "button--secondary"),
  );
  root.appendChild(createTitle(1, "Moje konverzace"));

  if (!tickets || tickets.length === 0) {
    root.appendChild(createText("Žádné konverzace."));
    return root;
  }

  tickets.forEach((ticket) => {
    const row = createDiv("ticket-row");
    const title = ticket.listing?.Title ?? `Ticket #${ticket.TicketID}`;
    const state = ticket.State === "open" ? "Otevřeno" : "Uzavřeno";
    const lastMsg = ticket.messages?.[0]?.Text ?? "-";

    row.appendChild(createTitle(3, title));
    row.appendChild(createText(`Stav: ${state}`));
    row.appendChild(createText(`Poslední zpráva: ${lastMsg}`));

    if (capabilities.canEnterDetail && onEnterDetail) {
      row.appendChild(
        addActionButton(
          () => onEnterDetail(ticket.TicketID),
          "Otevřít",
          "button--primary",
        ),
      );
    }

    root.appendChild(row);
  });

  return root;
}
