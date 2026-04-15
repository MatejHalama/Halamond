import { createTitle } from "../components/title.js";
import { createText } from "../components/text.js";
import { createDiv } from "../components/div.js";
import { createArticle } from "../components/article.js";

export function createCard({ title, description, button = ''})
{
    const titleElement = createTitle(2, title);
    const textElement1 = createText( description);

    const cardTitle = createDiv('card__title card__title--small', [titleElement]);
    const cardText = createDiv('card__text card__text--small bold', [textElement1]);

    return createArticle( "card" , [cardTitle, cardText, button]  );
}