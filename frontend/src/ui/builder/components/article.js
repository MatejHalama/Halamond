import { createElement } from "../createElement.js";


/**
 * @param {(string|HTMLElement)[]} [children=[]]
 * @param {string} classes
 * @returns {HTMLElement}
 */
export function createArticle(classes = '', children = [])
{
    return createElement('article', {className: classes}, children);
}