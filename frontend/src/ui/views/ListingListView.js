import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createButton, addActionButton } from "../builder/components/button.js";
import { createCard } from "../builder/layout/card.js";

const API_BASE = "http://localhost:3000";

function getFirstImageUrl(listing) {
  const pics = listing.pictures;
  if (!pics) return null;
  const arr = Array.isArray(pics) ? pics : [];
  if (arr.length === 0) return null;
  const p = arr[0];
  const path = p?.Path ?? p?.path ?? null;
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

export function ListingListView({ viewState, handlers }) {
  const {
    listings,
    myListings,
    capabilities,
    categories,
    filters,
    notifications,
  } = viewState;
  const { canEnterDetail } = capabilities;
  const { onEnterDetail, onSetFilters, onOpenNotification } = handlers;

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
  if (listings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "listings-empty";
    empty.textContent = "Žádné inzeráty.";
    cards.appendChild(empty);
  }
  listings.forEach((listing) => {
    const price =
      listing.Price != null ? `${Number(listing.Price).toFixed(0)} Kč` : "";
    const category = listing.category?.Name ?? "";
    const card = createCard({
      title: listing.Title,
      state: price,
      signed: category,
      imageUrl: getFirstImageUrl(listing),
      button: canEnterDetail
        ? (() => {
            const btn = createButton("button--primary", "Detail");
            btn.addEventListener("click", () =>
              onEnterDetail(listing.ListingID),
            );
            return btn;
          })()
        : null,
    });
    cards.appendChild(card);
  });

  const root = createSection("listing-list-view");
  root.appendChild(createTitle(1, "Inzeráty"));
  if (notifPanel) root.appendChild(notifPanel);
  root.appendChild(filterSection);
  root.appendChild(cards);

  const myVisible = (myListings ?? []).filter(
    (l) => l.State !== "deleted" && l.State !== "blocked",
  );
  if (myVisible.length > 0) {
    const mySection = createSection("my-listings");
    mySection.appendChild(createTitle(2, "Moje inzeráty"));
    const stateLabels = { draft: "Návrh", active: "Aktivní", sold: "Prodáno" };
    myVisible.forEach((listing) => {
      const row = document.createElement("div");
      row.className = "my-listing-row";
      const stateLabel = stateLabels[listing.State] ?? listing.State;
      const price =
        listing.Price != null ? `${Number(listing.Price).toFixed(0)} Kč` : "";
      const titleSpan = document.createElement("span");
      titleSpan.className = "my-listing-title";
      titleSpan.textContent = listing.Title;
      row.appendChild(titleSpan);

      const badgeSpan = document.createElement("span");
      badgeSpan.className = `my-listing-badge badge--${listing.State}`;
      badgeSpan.textContent = stateLabel;
      row.appendChild(badgeSpan);

      if (price) {
        const priceSpan = document.createElement("span");
        priceSpan.className = "my-listing-price";
        priceSpan.textContent = price;
        row.appendChild(priceSpan);
      }

      if (onEnterDetail) {
        row.addEventListener("click", () => onEnterDetail(listing.ListingID));
      }
      mySection.appendChild(row);
    });
    root.appendChild(mySection);
  }

  return root;
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

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function createFilterSection({ categories, filters, onSetFilters }) {
  const section = createSection("filters");

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Hledat...";
  searchInput.value = filters?.q ?? "";
  searchInput.addEventListener(
    "input",
    debounce((e) => onSetFilters?.({ q: e.target.value || "" }), 350),
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
  minInput.addEventListener(
    "input",
    debounce(
      (e) =>
        onSetFilters?.({
          minPrice: e.target.value ? Number(e.target.value) : null,
        }),
      350,
    ),
  );

  const maxInput = document.createElement("input");
  maxInput.type = "number";
  maxInput.placeholder = "Max Kč";
  maxInput.value = filters?.maxPrice ?? "";
  maxInput.addEventListener(
    "input",
    debounce(
      (e) =>
        onSetFilters?.({
          maxPrice: e.target.value ? Number(e.target.value) : null,
        }),
      350,
    ),
  );

  section.appendChild(searchInput);
  section.appendChild(categorySelect);
  section.appendChild(minInput);
  section.appendChild(maxInput);

  return section;
}
