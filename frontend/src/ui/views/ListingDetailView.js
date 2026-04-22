import { createText } from "../builder/components/text.js";
import { createTitle } from "../builder/components/title.js";
import { createDiv } from "../builder/components/div.js";
import {
  canGoBack,
  addActionButton,
  addButton,
} from "../builder/components/button.js";
import { createCard } from "../builder/layout/cardSmall.js";
import { createSection } from "../builder/components/section.js";
import { createElement } from "../builder/createElement.js";

export function ListingDetailView({ viewState, handlers }) {
  const { listing, capabilities } = viewState;
  const {
    canBackToList,
    canActivateListing,
    canSellListing,
    canDeleteListing,
    canEnterAdministration,
    canContactSeller,
  } = capabilities;
  const { onBackToList, onActivate, onSell, onDelete, onEnterAdministration, onContactSeller, onEnterTicketList } = handlers;

  const container = createDiv();
  container.appendChild(canGoBack(canBackToList, onBackToList));
  if (onEnterTicketList) {
    container.appendChild(addActionButton(onEnterTicketList, "← Moje konverzace", "button--secondary"));
  }

  if (!listing) {
    container.appendChild(createText("Listing was not found"));
    return container;
  }

  container.appendChild(createTitle(2, `Detail of ${listing.Title}`));
  /*container.appendChild(createText(`Datum: ${exam.date}`));
  container.appendChild(createText(`State: ${exam.status}`));
  container.appendChild(createText(`Capacity: ${exam.capacity}`));
  container.appendChild(createText(`Number of students: ${exam.registeredCount}`));*/

  /**
   * User
   */
  if (canActivateListing && onActivate) {
    container.appendChild(
      addActionButton(onActivate, "Activate", "button--success"),
    );
  }

  if (canSellListing && onSell) {
    container.appendChild(addActionButton(onSell, "Sold", "button--danger"));
  }

  if (canDeleteListing && onDelete) {
    container.appendChild(addActionButton(onDelete, "Delete", "button--danger"));
  }

  if (canEnterAdministration && onEnterAdministration)
  {
    container.appendChild(addActionButton(onEnterAdministration, 'Administration', 'button--success'));
  }

  if (canContactSeller && onContactSeller) {
    const section = createSection("contact-seller");
    section.appendChild(createTitle(3, "Kontaktovat prodejce"));
    const msgInput = createElement("textarea", {
      id: "contactMessage",
      placeholder: "Vaše zpráva...",
      rows: "3",
    });
    section.appendChild(msgInput);
    section.appendChild(
      addActionButton(
        () => {
          const msg = document.getElementById("contactMessage").value.trim();
          if (msg) onContactSeller(listing.ListingID, msg);
        },
        "Odeslat zprávu",
        "button--primary",
      ),
    );
    container.appendChild(section);
  }

  /**
   * Admin - stavové přechody
   */
  // TODO
  /*if (canUnpublish && onUnpublish)
  {
    container.appendChild(addActionButton(onUnpublish, 'Make not public', 'button--danger'));
  }

  if (canPublish && onPublish)
  {
    container.appendChild(addActionButton(onPublish, 'Make public', 'button--success'));
  }

  if (canCancel && onCancel)
  {
    container.appendChild(addActionButton(onCancel, 'Cancel', 'button--danger'));
  }

  if (canDelete && onDelete)
  {
    container.appendChild(addActionButton(onDelete, 'Delete', 'button--danger'));
  }*/

  return container;
}
