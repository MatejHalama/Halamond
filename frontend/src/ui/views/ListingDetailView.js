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
    canViewSellerProfile,
    canReportListing,
    canBlockListing,
  } = capabilities;
  const {
    onBackToList,
    onActivate,
    onSell,
    onDelete,
    onEnterAdministration,
    onContactSeller,
    onEnterTicketList,
    onEnterSellerProfile,
    onReportListing,
    onBlockListing,
  } = handlers;

  const container = createDiv();
  container.appendChild(canGoBack(canBackToList, onBackToList));

  if (!listing) {
    container.appendChild(createText("Listing was not found"));
    return container;
  }

  const pictures = Array.isArray(listing.pictures) ? listing.pictures : [];
  if (pictures.length > 0) {
    const gallery = createDiv("listing-gallery");
    pictures.forEach((pic) => {
      const path = pic?.Path ?? pic?.path ?? "";
      const url = path.startsWith("http")
        ? path
        : `http://localhost:3000${path}`;
      const img = document.createElement("img");
      img.src = url;
      img.alt = listing.Title ?? "";
      img.className = "listing-gallery__img";
      img.loading = "lazy";
      gallery.appendChild(img);
    });
    container.appendChild(gallery);
  }

  container.appendChild(createTitle(2, listing.Title));

  if (listing.Price != null) {
    const priceEl = document.createElement("p");
    priceEl.className = "listing-price";
    priceEl.textContent = `${Number(listing.Price).toFixed(0)} Kč`;
    container.appendChild(priceEl);
  }
  if (listing.Description) {
    container.appendChild(createText(listing.Description));
  }

  const sellerName = listing.user?.Username ?? null;
  const sellerId = listing.user?.UserID ?? null;
  if (sellerName) {
    const sellerDiv = createDiv("listing-seller");
    sellerDiv.appendChild(createText(`Prodejce: ${sellerName}`));
    if (canViewSellerProfile && onEnterSellerProfile && sellerId) {
      sellerDiv.appendChild(
        addActionButton(
          () => onEnterSellerProfile(sellerId),
          "Profil prodejce",
          "button--secondary",
        ),
      );
    }
    container.appendChild(sellerDiv);
  }
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
    container.appendChild(
      addActionButton(onDelete, "Delete", "button--danger"),
    );
  }

  if (canEnterAdministration && onEnterAdministration) {
    container.appendChild(
      addActionButton(
        onEnterAdministration,
        "Administration",
        "button--success",
      ),
    );
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

  if (canReportListing && onReportListing) {
    container.appendChild(createReportForm((text) => onReportListing(text)));
  }

  if (canBlockListing && onBlockListing) {
    const adminSection = createSection("admin-zone");
    adminSection.appendChild(createTitle(3, "Administrace"));
    const blockBtn = addActionButton(
      null,
      "Blokovat inzerát",
      "button--danger admin-action",
    );
    blockBtn.addEventListener("click", async () => {
      blockBtn.disabled = true;
      await onBlockListing();
    });
    adminSection.appendChild(blockBtn);
    container.appendChild(adminSection);
  }

  return container;
}

function createReportForm(onSubmit) {
  const section = createSection("report-form");
  section.appendChild(createTitle(3, "Nahlásit inzerát"));
  const input = createElement("textarea", {
    placeholder: "Důvod hlášení...",
    rows: "2",
  });
  section.appendChild(input);
  const btn = addActionButton(null, "Nahlásit", "button--danger");
  btn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;
    btn.disabled = true;
    const result = await onSubmit(text);
    if (result?.status === "SUCCESS") {
      section.innerHTML = "";
      section.appendChild(createText("Inzerát byl nahlášen. Děkujeme."));
    } else {
      btn.disabled = false;
    }
  });
  section.appendChild(btn);
  return section;
}
