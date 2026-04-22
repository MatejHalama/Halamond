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
    const lastMsg = ticket.messages?.[0];
    const isUnread =
      ticket.State === "open" && lastMsg && lastMsg.sender !== auth.userId;

    const row = createDiv("ticket-row");
    const title = ticket.listing?.Title ?? `Ticket #${ticket.TicketID}`;
    const stateLabel = ticket.State === "open" ? "Otevřeno" : "Uzavřeno";

    row.appendChild(createTitle(3, isUnread ? `● ${title}` : title));
    row.appendChild(createText(`Stav: ${stateLabel}`));
    row.appendChild(createText(`Poslední zpráva: ${lastMsg?.Text ?? "-"}`));

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
