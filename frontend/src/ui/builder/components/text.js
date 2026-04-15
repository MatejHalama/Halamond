import { createElement } from "../createElement.js";


/**
 * @param {string} classes
 * @param {array} children
 * @returns {HTMLElement}
 */
export function createText( children = [], classes = '',)
{
    return createElement('p', {className: classes}, [children]);
}