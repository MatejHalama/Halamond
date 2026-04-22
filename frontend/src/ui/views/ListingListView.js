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
    unreadCount,
    notificationCount,
    auth,
  } = viewState;
  const { canEnterDetail, canCreateListing } = capabilities;
  const { onEnterDetail, onCreateListing, onEnterTicketList, onSetFilters } =
    handlers;

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

  const cards = createSection("cards");
  listings.forEach((listing) => {
    const price =
      listing.Price != null ? `${Number(listing.Price).toFixed(0)} Kč` : "";
    const card = createCard({
      title: listing.Title,
      state: price,
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
      filterSection,
      cards,
      createBtn,
    ].filter(Boolean),
  );
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
