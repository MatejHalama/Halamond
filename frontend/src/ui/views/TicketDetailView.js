import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { createDiv } from "../builder/components/div.js";
import { addActionButton } from "../builder/components/button.js";
import { createElement } from "../builder/createElement.js";

export function TicketDetailView({ viewState, handlers }) {
  const { ticket, auth, capabilities } = viewState;
  const { onBackToTickets, onSendMessage, onCloseTicket, onRateSeller } = handlers;

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

  // rating form for buyer
  if (capabilities.canRateSeller && onRateSeller) {
    const sellerAuthorId = ticket.listing?.author;
    if (sellerAuthorId) {
      const ratingSection = createSection("rating-form");
      ratingSection.appendChild(createTitle(2, "Ohodnotit prodejce"));

      const select = document.createElement("select");
      [1, 2, 3, 4, 5].forEach((n) => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = "★".repeat(n) + " (" + n + ")";
        select.appendChild(opt);
      });
      select.value = "5";
      ratingSection.appendChild(select);

      const errorEl = createText([], "rating-error");
      ratingSection.appendChild(errorEl);

      const submitBtn = addActionButton(null, "Odeslat hodnocení", "button--primary");
      submitBtn.addEventListener("click", async () => {
        submitBtn.disabled = true;
        errorEl.textContent = "";
        const result = await onRateSeller(sellerAuthorId, parseInt(select.value));
        if (result?.status === "SUCCESS") {
          ratingSection.innerHTML = "";
          ratingSection.appendChild(createText(["Hodnocení odesláno. Děkujeme!"], "rating-success"));
        } else {
          errorEl.textContent = result?.reason ?? "Chyba při odesílání hodnocení.";
          submitBtn.disabled = false;
        }
      });
      ratingSection.appendChild(submitBtn);
      root.appendChild(ratingSection);
    }
  }

  return root;
}
