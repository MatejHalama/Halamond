import {createDiv} from "../builder/components/div.js";
import {canGoBack, submitButton, addActionButton} from "../builder/components/button.js";
import { createTitle } from "../builder/components/title.js";
import { createText } from "../builder/components/text.js";
import { createInput } from "../builder/components/input.js";

export function ListingAdministrationView({ viewState, handlers })
{
    const { listing, capabilities } = viewState;
    const { canUpdateCapacity, canUpdateListing, canCancel, canDelete, canBackToList } = capabilities;
    const { onUpdateCapacity, onUpdate, onCancel, onDelete, onBackToList } = handlers;


    const root = createDiv();
    root.appendChild(canGoBack(canBackToList, onBackToList));
    const container = createDiv('text-center w-25');
    container.appendChild(createTitle(1, `Administration of: ${listing.Title ?? listing.ListingID}`));

    if (!listing)
    {
        container.appendChild(createText('Listing was not found'));
        return container;
    }

    /*if (canUpdateCapacity && onUpdateCapacity)
    {
        let capacityInput = createInput('', {
                type: 'number',
                value: exam.capacity,
                min: 0,
                name: 'examCapacity',
                id: 'examCapacityInput',
            }
        );
        const formCapacity = createDiv('', [
                capacityInput,
                submitButton('Adjust capacity', () => onUpdateCapacity(Number(document.getElementById('examCapacityInput').value)))
            ]
        );

        container.appendChild(formCapacity);
    }*/

    if (canUpdateListing && onUpdate)
    {
        let titleInput = createInput('', {
            type: 'text',
            value: listing.Title,
            name: 'listingTitle',
            id: 'listingTitleInput',
        });
        let descriptionInput = createInput('', {
            type: 'text',
            value: listing.Description ?? '',
            name: 'listingDescription',
            id: 'listingDescriptionInput',
        });
        let priceInput = createInput('', {
            type: 'number',
            value: listing.Price,
            min: 0,
            name: 'listingPrice',
            id: 'listingPriceInput',
        });
        // TODO: category select

        const formData = createDiv('', [
                titleInput,
                descriptionInput,
                priceInput,
                submitButton('Save', () => onUpdate({
                            title: document.getElementById('listingTitleInput').value,
                            description: document.getElementById('listingDescriptionInput').value,
                            price: document.getElementById('listingPriceInput').value,
                            //categoryId: document.getElementById('listingCategoryIdInput').value,
                        }
                    )
                )
            ]
        );
        container.appendChild(formData);
    }

    /**
     * Cancel
     */

    /*if (canCancel && onCancel) {
        const btn = document.createElement('button');
        btn.textContent = 'Zrušit';
        btn.addEventListener('click', onCancel);
        container.appendChild(btn);
    }

    if (canDelete && onDelete)
    {
        container.appendChild(addActionButton(onDelete, 'Delete', 'button--danger'));
    }*/


    root.appendChild(container);
    return root;
}
