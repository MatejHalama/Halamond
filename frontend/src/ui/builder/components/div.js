import { createElement } from "../createElement.js";


/**
 * @param {string} classes
 * @param {array} children
 * @param {...Object<string, any>} options
 * @returns {HTMLElement}
 */
export function createDiv(classes = '', children = [], options = {})
{
    return createElement('div', {className: classes, ...options}, children);
}