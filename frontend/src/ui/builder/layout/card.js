import { createTitle } from "../components/title.js";
import { createText } from "../components/text.js";
import { createDiv } from "../components/div.js";
import { createArticle } from "../components/article.js";

export function createCard({ title, date, state, signed, button, imageUrl }) {
  const titleElement = createTitle(2, title);
  const stateElement = createText(state);
  const signedElement = createText(signed);

  let imgEl = null;
  if (imageUrl) {
    imgEl = document.createElement("img");
    imgEl.src = imageUrl;
    imgEl.alt = title ?? "";
    imgEl.className = "card__img";
    imgEl.loading = "lazy";
  }

  const cardTitle = createDiv("card__title", [titleElement]);
  const cardText = createDiv("card__text", [stateElement, signedElement]);
  const footer = createDiv(
    "card__footer",
    Array.isArray(button) ? button : button ? [button] : [],
  );

  return createArticle(
    "card",
    [imgEl, cardTitle, cardText, footer].filter(Boolean),
  );
}
