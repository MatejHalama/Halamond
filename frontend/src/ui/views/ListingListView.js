import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createButton, addButton } from "../builder/components/button.js";
import { createCard } from "../builder/layout/card.js";

// TODO: complete ListingListView
export function ListingListView({ viewState, handlers })
{
  const { listings, capabilities } = viewState;
  const { canEnterDetail, canEnterAdministration, canCreateListing } = capabilities;
  const { onEnterDetail, onEnterAdministration, onCreateListing } = handlers;

  const cards = createSection( 'cards');

  console.log(capabilities);
  console.log(handlers);

  listings.forEach((listing) =>
    {
      const card = createCard({
        title: listing.Title,
        /*date: exam.date,
        state: `State: ${exam.status}`,*/
        button: [
          addButton( canEnterDetail, onEnterDetail, () => onEnterDetail(listing.ListingID), 'Detail', 'button--primary'),
          addButton( canEnterAdministration, onEnterAdministration, () => onEnterAdministration(listing.ListingID), 'Administration', 'button--success')
        ]
      });
      cards.appendChild(card);
    }
  );

  return createSection('', [
        createTitle(1, 'Listings'),
        cards,
        newEntry(canCreateListing, onCreateListing)
      ]
  );
}

function newEntry(canCreateListing, onCreateListing)
{
  if (canCreateListing && onCreateListing)
  {
    const btn = createButton('button--primary mt-15', 'Create new listing');
    btn.addEventListener('click', () =>
      onCreateListing(
        {
          title: 'Nový inzerát',
          price: '100',
        }
      ),
    );
    return btn;
  }
}