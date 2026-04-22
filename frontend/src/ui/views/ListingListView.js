import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createButton, addActionButton } from "../builder/components/button.js";
import { createCard } from "../builder/layout/card.js";

export function ListingListView({ viewState, handlers }) {
  const {
    listings,
    capabilities,
    categories,
    filters,
    notifications,
    unreadCount,
    notificationCount,
    auth,
  } = viewState;
  const { canEnterDetail, canCreateListing } = capabilities;
  const {
    onEnterDetail,
    onCreateListing,
    onEnterTicketList,
    onSetFilters,
    onOpenNotification,
  } = handlers;

  const totalUnread = (unreadCount ?? 0) + (notificationCount ?? 0);
  const ticketBtn =
    auth?.userId && onEnterTicketList
      ? addActionButton(
          onEnterTicketList,
          `Moje konverzace${totalUnread > 0 ? ` (${totalUnread})` : ""}`,
          "button--secondary",
        )
      : null;

  const filterSection = createFilterSection({
    categories,
    filters,
    onSetFilters,
  });
  const notifPanel = createNotificationsPanel({
    notifications,
    onOpenNotification,
  });

  const cards = createSection("cards");
  listings.forEach((listing) => {
    const price =
      listing.Price != null ? `${Number(listing.Price).toFixed(0)} Kč` : "";
    const category = listing.category?.Name ?? "";
    const card = createCard({
      title: listing.Title,
      state: price,
      signed: category,
      button: [
        canEnterDetail
          ? (() => {
              const btn = createButton("button--primary", "Detail");
              btn.addEventListener("click", () =>
                onEnterDetail(listing.ListingID),
              );
              return btn;
            })()
          : null,
      ].filter(Boolean),
    });
    cards.appendChild(card);
  });

  const createBtn =
    canCreateListing && onCreateListing
      ? (() => {
          const btn = createButton("button--primary mt-15", "Přidat inzerát");
          btn.addEventListener("click", () =>
            onCreateListing({ title: "Nový inzerát", price: "100" }),
          );
          return btn;
        })()
      : null;

  return createSection(
    "",
    [
      createTitle(1, "Inzeráty"),
      ticketBtn,
      notifPanel,
      filterSection,
      cards,
      createBtn,
    ].filter(Boolean),
  );
}

function createNotificationsPanel({ notifications, onOpenNotification }) {
  const unread = (notifications ?? []).filter((n) => !n.Read);
  if (unread.length === 0) return null;

  const panel = createSection("notifications-panel");
  const title = document.createElement("strong");
  title.textContent = `Notifikace (${unread.length})`;
  panel.appendChild(title);

  unread.forEach((n) => {
    const item = document.createElement("div");
    item.className = "notification-item";
    item.textContent = n.Text;
    if (n.ticket && onOpenNotification) {
      item.style.cursor = "pointer";
      item.addEventListener("click", () => onOpenNotification(n.ticket));
    }
    panel.appendChild(item);
  });

  return panel;
}

function createFilterSection({ categories, filters, onSetFilters }) {
  const section = createSection("filters");

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Hledat...";
  searchInput.value = filters?.q ?? "";
  searchInput.addEventListener("input", (e) =>
    onSetFilters?.({ q: e.target.value || "" }),
  );

  const categorySelect = document.createElement("select");
  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = "Všechny kategorie";
  categorySelect.appendChild(allOpt);
  (categories ?? []).forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.CategoryID;
    opt.textContent = cat.Name;
    opt.selected = filters?.categoryId === cat.CategoryID;
    categorySelect.appendChild(opt);
  });
  categorySelect.addEventListener("change", (e) =>
    onSetFilters?.({
      categoryId: e.target.value ? parseInt(e.target.value) : null,
    }),
  );

  const minInput = document.createElement("input");
  minInput.type = "number";
  minInput.placeholder = "Min Kč";
  minInput.value = filters?.minPrice ?? "";
  minInput.addEventListener("input", (e) =>
    onSetFilters?.({
      minPrice: e.target.value ? Number(e.target.value) : null,
    }),
  );

  const maxInput = document.createElement("input");
  maxInput.type = "number";
  maxInput.placeholder = "Max Kč";
  maxInput.value = filters?.maxPrice ?? "";
  maxInput.addEventListener("input", (e) =>
    onSetFilters?.({
      maxPrice: e.target.value ? Number(e.target.value) : null,
    }),
  );

  section.appendChild(searchInput);
  section.appendChild(categorySelect);
  section.appendChild(minInput);
  section.appendChild(maxInput);

  return section;
}
