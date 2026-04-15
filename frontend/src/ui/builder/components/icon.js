import { createElement } from "../createElement.js";


/**
 * @param {string} classes - CSS třídy
 * @returns {HTMLElement}
 */
export function createIcon(classes )
{
    return createElement('i' , {className: classes}, []);
}