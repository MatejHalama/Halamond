import { createText } from "../builder/components/text.js";
import { createTitle } from "../builder/components/title.js";
import { createDiv } from "../builder/components/div.js";
import {
  canGoBack,
  addActionButton,
} from "../builder/components/button.js";
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
    canComment,
    canContactSeller,
    canViewSellerProfile,
    canReportListing,
    canBlockListing,
    canUnblockListing,
  } = capabilities;
  const {
    onBackToList,
    onActivate,
    onSell,
    onDelete,
    onEnterAdministration,
    onContactSeller,
    onEnterSellerProfile,
    onReportListing,
    onBlockListing,
    onUnblockListing,
    onSubmitComment,
    onReply,
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
  if (canReportListing && onReportListing) {
    container.appendChild(createReportForm((text) => onReportListing(text)));
  }

  if (
    (canBlockListing && onBlockListing) ||
    (canUnblockListing && onUnblockListing)
  ) {
    const adminSection = createSection("admin-zone");
    adminSection.appendChild(createTitle(3, "Administrace"));

    if (canBlockListing && onBlockListing) {
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
    }

    if (canUnblockListing && onUnblockListing) {
      const unblockBtn = addActionButton(
        null,
        "Odblokovat inzerát",
        "button--success admin-action",
      );
      unblockBtn.addEventListener("click", async () => {
        unblockBtn.disabled = true;
        await onUnblockListing();
      });
      adminSection.appendChild(unblockBtn);
    }

    container.appendChild(adminSection);
  }

  container.appendChild(createCommentSection(listing.comments, canComment, onSubmitComment, onReply));

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

function createCommentSection(comments, canComment, onSubmitComment, onReply) {
  const commentSection = createSection("listing-comments");
  commentSection.appendChild(createTitle(3, "Komentáře"));

  if (canComment) {
    const input = createElement("textarea", {
      placeholder: "Komentář...",
      rows: "3",
    });
    commentSection.appendChild(input);

    commentSection.appendChild(
        addActionButton(
            () => {
              const value = input.value.trim();
              if (value) onSubmitComment(null, value);
            },
            "Odeslat komentář",
            "button--primary",
        ),
    );
  }

  if (comments.length === 0) {
    commentSection.appendChild(createText(["Žádné komentáře."]));
  }
  else {
    comments.forEach((comment) => {
      commentSection.appendChild(createCommentItem(comment, canComment, onSubmitComment, onReply));
    });
  }
  return commentSection;
}

function createCommentItem(comment, canComment, onSubmitComment, onReply) {
  const item = document.createElement("div");
  item.className = "comment";

  const nameText = document.createElement("p");
  nameText.textContent = comment.authorUser.Username;
  item.appendChild(nameText);

  const commentText = document.createElement("p");
  commentText.textContent = comment.Text;
  item.appendChild(commentText);

  if (canComment) {
    const input = createElement("textarea", {
      placeholder: "Odpověď...",
      rows: "2",
    });

    const submit = addActionButton(
        () => {
          const value = input.value.trim();
          if (value) onSubmitComment(comment.CommentID, value);
        },
        "Odeslat odpověď",
        "button--primary",
    );

    item.appendChild(
        addActionButton(
            (e) => {
              item.removeChild(e.target);
              item.appendChild(input);
              item.appendChild(submit);
            },
            "Odpovědět",
            "button--secondary",
        ),
    );
  }

  comment.replies.forEach((reply) => {
    item.appendChild(createCommentItem(reply, canComment, onSubmitComment, onReply));
  });
  return item;
}
