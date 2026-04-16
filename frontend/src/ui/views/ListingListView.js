import { createSection } from "../builder/components/section.js";
import { createTitle } from "../builder/components/title.js";
import { createButton, addButton } from "../builder/components/button.js";
import { createCard } from "../builder/layout/card.js";

// TODO: complete ListingListView
export function ListingListView({ viewState, handlers })
{
  const { listings, capabilities } = viewState;
  const { canEnterDetail, canEnterAdministration, canCreateExam } = capabilities;
  const { onEnterDetail, onEnterAdministration, onCreateExamTerm } = handlers;

  const cards = createSection( 'cards');

  listings.forEach((listing) =>
    {
      const card = createCard({
        title: listing.Title,
        /*date: exam.date,
        state: `State: ${exam.status}`,*/
        button: [
          addButton( canEnterDetail, onEnterDetail, () => onEnterDetail(listing.ListingID), 'Detail', 'button--primary'),
          /*addButton( canEnterAdministration, onEnterAdministration, () => onEnterAdministration(exam.id), 'Administration', 'button--success')*/
        ]
      });
      cards.appendChild(card);
    }
  );

  return createSection('', [
        createTitle(1, 'Listings'),
        cards,
        //newEntry(canCreateExam, onCreateExamTerm)
      ]
  );
}

function newEntry(canCreateExam, onCreateExamTerm)
{
  if (canCreateExam && onCreateExamTerm)
  {
    const btn = createButton('button--primary mt-15', 'Create new entry');
    btn.addEventListener('click', () =>
      onCreateExamTerm(
        {
          name: 'Nový zkouškový termín',
          date: '2026-01-01T10:00',
          capacity: 10,
        }
      ),
    );
    return btn;
  }
}