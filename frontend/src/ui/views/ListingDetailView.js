import { createText } from "../builder/components/text.js";
import { createTitle } from "../builder/components/title.js";
import { createDiv } from "../builder/components/div.js";
import {canGoBack, addActionButton, addButton} from "../builder/components/button.js";
import {createCard} from "../builder/layout/cardSmall.js";
import {createSection} from "../builder/components/section.js";

export function ListingDetailView({ viewState, handlers })
{
  const { listing, capabilities } = viewState;
  const { canBackToList, canActivateListing, canSellListing} = capabilities;
  const { onBackToList, onActivate, onSell } = handlers;

  const container = createDiv();
  container.appendChild(canGoBack(canBackToList, onBackToList));

  if (!listing)
  {
    container.appendChild(createText('Listing was not found'));
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
  if (canActivateListing  && onActivate)
  {
    container.appendChild(addActionButton(onActivate, 'Activate', 'button--success'));
  }

  if (canSellListing && onSell)
  {
    container.appendChild(addActionButton(onSell, 'Sold', 'button--danger'));
  }

  /**
   * Teacher - stavové přechody
   */
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
  }

  if (canEnterAdministration && onEnterAdministration)
  {
    container.appendChild(addActionButton(onEnterAdministration, 'Administration', 'button--success'));
  }*/

  return container;
}
