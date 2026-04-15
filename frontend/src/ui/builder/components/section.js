import { createElement } from "../createElement.js";


/**
 * @param {(string|HTMLElement)[]} [children=[]]
 * @param {string} classes
 * @returns {HTMLElement}
 */
export function createSection(classes = '', children = [])
{
    return createElement('section', {className: classes}, children);
}