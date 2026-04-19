import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { createDiv } from "../builder/components/div.js";
import { addActionButton } from "../builder/components/button.js";
import { createElement } from "../builder/createElement.js";

export function TicketDetailView({ viewState, handlers }) {
  const { ticket, auth, capabilities } = viewState;
  const { onBackToTickets, onSendMessage, onCloseTicket } = handlers;

  const root = createSection("ticket-detail-view");
  root.appendChild(
    addActionButton(onBackToTickets, "← Zprávy", "button--secondary"),
  );

  if (!ticket) {
    root.appendChild(createText("Konverzace nenalezena."));
    return root;
  }

  const title = ticket.listing?.Title ?? `Ticket #${ticket.TicketID}`;
  root.appendChild(createTitle(1, title));
  root.appendChild(
    createText(`Stav: ${ticket.State === "open" ? "Otevřeno" : "Uzavřeno"}`),
  );

  if (capabilities.canCloseTicket && onCloseTicket) {
    root.appendChild(
      addActionButton(
        () => onCloseTicket(ticket.TicketID),
        "Uzavřít konverzaci",
        "button--danger",
      ),
    );
  }

  // messages
  const msgList = createDiv("messages");
  (ticket.messages ?? []).forEach((msg) => {
    const isMe = msg.sender === auth.userId;
    const bubble = createDiv(
      isMe ? "message message--mine" : "message message--theirs",
    );
    bubble.appendChild(createText(msg.senderUser?.Username ?? "Neznámý"));
    bubble.appendChild(createText(msg.Text ?? ""));
    msgList.appendChild(bubble);
  });
  root.appendChild(msgList);

  // send form
  if (capabilities.canSendMessage && onSendMessage) {
    const form = createSection("send-form");
    const input = createElement("textarea", {
      id: "msgInput",
      placeholder: "Napište zprávu...",
      rows: "3",
    });
    form.appendChild(input);
    form.appendChild(
      addActionButton(
        () => {
          const text = document.getElementById("msgInput").value.trim();
          if (text) {
            onSendMessage(ticket.TicketID, text);
            document.getElementById("msgInput").value = "";
          }
        },
        "Odeslat",
        "button--primary",
      ),
    );
    root.appendChild(form);
  }

  return root;
}
