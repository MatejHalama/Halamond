import { createTitle } from "../components/title.js";
import { createText } from "../components/text.js";
import { createDiv } from "../components/div.js";
import { createArticle } from "../components/article.js";

export function createCard({ title, date, state, signed, button})
{
    const titleElement = createTitle(2, title);
    const dateElement = createText( date);
    const stateElement = createText( state);
    const signedElement = createText( signed);

    const cardTitle = createDiv('card__title', [titleElement]);
    const cardText = createDiv('card__text', [dateElement, stateElement, signedElement]);

    return createArticle( "card" , [cardTitle, cardText, button]  );
}