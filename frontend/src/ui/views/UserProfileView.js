import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { addActionButton } from "../builder/components/button.js";

export function UserProfileView({ viewState, handlers }) {
  const { profileUser, capabilities } = viewState;
  const { canBackToList, canLogout } = capabilities;
  const { onBackToList, onLogout } = handlers;

  const container = createSection("");

  if (canBackToList && onBackToList) {
    container.appendChild(
      addActionButton(onBackToList, "← Zpět", "button--secondary"),
    );
  }

  if (!profileUser) {
    container.appendChild(createText(["Načítání profilu..."]));
    return container;
  }

  const header = createSection("profile-header");
  header.appendChild(createTitle(1, profileUser.Username));

  if (profileUser.avgRating != null) {
    header.appendChild(
      createText(
        [`Průměrné hodnocení: ${Number(profileUser.avgRating).toFixed(1)} / 5`],
        "profile-rating",
      ),
    );
  } else {
    header.appendChild(createText(["Zatím bez hodnocení"], "profile-rating"));
  }

  header.appendChild(
    createText(
      [
        `Člen od: ${new Date(profileUser.Createdat).toLocaleDateString("cs-CZ")}`,
      ],
      "profile-meta",
    ),
  );
  container.appendChild(header);

  const listingsSection = createSection("profile-listings");
  listingsSection.appendChild(createTitle(2, "Aktivní inzeráty"));
  const userListings = profileUser.listings ?? [];
  if (userListings.length === 0) {
    listingsSection.appendChild(createText(["Žádné aktivní inzeráty."]));
  } else {
    userListings.forEach((listing) => {
      const item = document.createElement("div");
      item.className = "profile-listing-item";
      const price =
        listing.Price != null ? `${Number(listing.Price).toFixed(0)} Kč` : "";
      item.textContent = `${listing.Title}${price ? " - " + price : ""}`;
      listingsSection.appendChild(item);
    });
  }
  container.appendChild(listingsSection);

  const ratingsSection = createSection("profile-ratings");
  ratingsSection.appendChild(createTitle(2, "Hodnocení"));
  const ratings = profileUser.receivedRatings ?? [];
  if (ratings.length === 0) {
    ratingsSection.appendChild(createText(["Žádná hodnocení."]));
  } else {
    ratings.forEach((r) => {
      const item = document.createElement("div");
      item.className = "profile-rating-item";
      const stars = "★".repeat(r.Rating) + "☆".repeat(5 - r.Rating);
      const reviewer = r.reviewerUser?.Username ?? "Anonymní";
      item.textContent = `${stars} - ${reviewer}`;
      ratingsSection.appendChild(item);
    });
  }
  container.appendChild(ratingsSection);

  if (canLogout && onLogout) {
    container.appendChild(
      addActionButton(onLogout, "Odhlásit se", "button--danger"),
    );
  }

  return container;
}
